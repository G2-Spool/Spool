import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  ContentGenerationRequest, 
  GeneratedExercise, 
  AssessmentRequest, 
  AssessmentResponse,
  CognitiveAnalysis,
  LangflowConfig 
} from '../types/content.types.js';
import { logger } from '../utils/logger.js';

export class LangflowService {
  private config: LangflowConfig;
  private axiosInstance;

  constructor(config: LangflowConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate a new exercise based on student's learning needs
   */
  async generateExercise(request: ContentGenerationRequest): Promise<GeneratedExercise> {
    try {
      const payload = {
        flowId: this.config.flowId,
        inputs: {
          userId: request.userId,
          topic: request.topic,
          difficulty: request.difficulty,
          learningObjectives: request.learningObjectives,
          focusArea: request.focusArea || '',
          previousAttempts: request.previousAttempts ? JSON.stringify(request.previousAttempts) : '',
        },
      };

      const response = await this.axiosInstance.post('/generate-exercise', payload);
      
      const exerciseData = response.data.outputs.exercise;
      
      return {
        id: uuidv4(),
        topic: request.topic,
        difficulty: request.difficulty,
        type: exerciseData.type,
        question: exerciseData.question,
        context: exerciseData.context,
        hints: exerciseData.hints || [],
        correctAnswer: exerciseData.correctAnswer,
        explanation: exerciseData.explanation,
        learningObjectives: request.learningObjectives,
        estimatedTime: exerciseData.estimatedTime || 10,
        metadata: {
          createdAt: new Date(),
          generatedFor: request.userId,
          focusAreas: request.focusArea ? [request.focusArea] : [],
        },
      };
    } catch (error) {
      logger.error('Error generating exercise:', error);
      throw new Error('Failed to generate exercise');
    }
  }

  /**
   * Assess student's answer and provide cognitive analysis
   */
  async assessAnswer(request: AssessmentRequest): Promise<AssessmentResponse> {
    try {
      const payload = {
        flowId: this.config.flowId,
        inputs: {
          exerciseId: request.exerciseId,
          studentAnswer: request.studentAnswer,
          userId: request.userId,
        },
      };

      const response = await this.axiosInstance.post('/assess-answer', payload);
      
      const assessmentData = response.data.outputs.assessment;
      
      const cognitiveAnalysis: CognitiveAnalysis = {
        understandingLevel: assessmentData.understandingLevel,
        misconceptions: assessmentData.misconceptions || [],
        strengths: assessmentData.strengths || [],
        weaknesses: assessmentData.weaknesses || [],
        recommendedFocus: assessmentData.recommendedFocus || [],
        cognitivePattern: assessmentData.cognitivePattern || 'standard',
      };

      return {
        score: assessmentData.score,
        feedback: assessmentData.feedback,
        cognitiveAnalysis,
        nextSteps: assessmentData.nextSteps || [],
      };
    } catch (error) {
      logger.error('Error assessing answer:', error);
      throw new Error('Failed to assess answer');
    }
  }

  /**
   * Generate adaptive exercise based on cognitive analysis
   */
  async generateAdaptiveExercise(
    userId: string,
    cognitiveAnalysis: CognitiveAnalysis,
    topic: string
  ): Promise<GeneratedExercise> {
    try {
      // Determine focus area based on weaknesses
      const focusArea = cognitiveAnalysis.weaknesses[0] || cognitiveAnalysis.recommendedFocus[0];
      
      // Adjust difficulty based on understanding level
      let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
      if (cognitiveAnalysis.understandingLevel < 40) {
        difficulty = 'beginner';
      } else if (cognitiveAnalysis.understandingLevel > 70) {
        difficulty = 'advanced';
      }

      const request: ContentGenerationRequest = {
        userId,
        topic,
        difficulty,
        learningObjectives: cognitiveAnalysis.recommendedFocus,
        focusArea,
      };

      return await this.generateExercise(request);
    } catch (error) {
      logger.error('Error generating adaptive exercise:', error);
      throw new Error('Failed to generate adaptive exercise');
    }
  }

  /**
   * Get learning path recommendations
   */
  async getLearningPathRecommendations(userId: string, currentTopic: string): Promise<string[]> {
    try {
      const payload = {
        flowId: this.config.flowId,
        inputs: {
          userId,
          currentTopic,
        },
      };

      const response = await this.axiosInstance.post('/learning-path', payload);
      
      return response.data.outputs.recommendations || [];
    } catch (error) {
      logger.error('Error getting learning path recommendations:', error);
      throw new Error('Failed to get learning path recommendations');
    }
  }

  /**
   * Generate exercise variations for practice
   */
  async generateExerciseVariations(
    baseExercise: GeneratedExercise,
    count: number = 3
  ): Promise<GeneratedExercise[]> {
    try {
      const variations: GeneratedExercise[] = [];
      
      for (let i = 0; i < count; i++) {
        const payload = {
          flowId: this.config.flowId,
          inputs: {
            baseQuestion: baseExercise.question,
            topic: baseExercise.topic,
            difficulty: baseExercise.difficulty,
            type: baseExercise.type,
            variationNumber: i + 1,
          },
        };

        const response = await this.axiosInstance.post('/generate-variation', payload);
        const variationData = response.data.outputs.variation;
        
        variations.push({
          ...baseExercise,
          id: uuidv4(),
          question: variationData.question,
          correctAnswer: variationData.correctAnswer,
          explanation: variationData.explanation,
          metadata: {
            ...baseExercise.metadata,
            createdAt: new Date(),
          },
        });
      }
      
      return variations;
    } catch (error) {
      logger.error('Error generating exercise variations:', error);
      throw new Error('Failed to generate exercise variations');
    }
  }
} 