import { 
  ContentGenerationRequest, 
  GeneratedExercise, 
  AssessmentRequest, 
  AssessmentResponse,
  LearningPath,
  ExerciseAttempt
} from '../types/content.types.js';
import { LangflowService } from '../integrations/langflow.service.js';
import { PineconeService } from '../integrations/pinecone.service.js';
import { DatabaseService } from './database.service.js';
import { logger } from '../utils/logger.js';

export class ContentService {
  constructor(
    private langflowService: LangflowService,
    private pineconeService: PineconeService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Generate a new exercise for a user
   */
  async generateExercise(request: ContentGenerationRequest): Promise<GeneratedExercise> {
    try {
      // Get user's learning path
      const learningPath = await this.databaseService.getLearningPath(request.userId);
      
      // Get recent attempts if not provided
      if (!request.previousAttempts) {
        request.previousAttempts = await this.databaseService.getUserAttempts(request.userId, 5);
      }

      // Search for similar exercises in Pinecone
      const similarExercises = await this.pineconeService.searchExercises(
        request.topic,
        request.difficulty
      );

      // Generate new exercise using Langflow
      const exercise = await this.langflowService.generateExercise(request);

      // Store exercise in database
      await this.databaseService.pool.query(
        `INSERT INTO generated_exercises 
         (id, topic, difficulty, type, question, context, hints, 
          correct_answer, explanation, learning_objectives, estimated_time, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          exercise.id,
          exercise.topic,
          exercise.difficulty,
          exercise.type,
          exercise.question,
          exercise.context,
          exercise.hints,
          exercise.correctAnswer,
          exercise.explanation,
          exercise.learningObjectives,
          exercise.estimatedTime,
          JSON.stringify(exercise.metadata),
        ]
      );

      // Add to Pinecone for future similarity searches
      await this.pineconeService.addContent(
        `${exercise.question}\n${exercise.context || ''}\n${exercise.explanation}`,
        {
          id: exercise.id,
          topic: exercise.topic,
          subtopic: exercise.metadata.focusAreas[0] || '',
          difficulty: exercise.difficulty,
          type: exercise.type,
          tags: exercise.learningObjectives,
        }
      );

      return exercise;
    } catch (error) {
      logger.error('Error generating exercise:', error);
      throw error;
    }
  }

  /**
   * Assess a student's answer
   */
  async assessAnswer(request: AssessmentRequest): Promise<AssessmentResponse> {
    try {
      // Get exercise details from database
      const exerciseResult = await this.databaseService.pool.query(
        'SELECT * FROM generated_exercises WHERE id = $1',
        [request.exerciseId]
      );

      if (exerciseResult.rows.length === 0) {
        throw new Error('Exercise not found');
      }

      const exercise = exerciseResult.rows[0];

      // Assess answer using Langflow
      const assessment = await this.langflowService.assessAnswer({
        ...request,
        correctAnswer: exercise.correct_answer,
      });

      // Save attempt to database
      await this.databaseService.saveExerciseAttempt({
        userId: request.userId,
        exerciseId: request.exerciseId,
        studentAnswer: request.studentAnswer,
        correctAnswer: exercise.correct_answer,
        score: assessment.score,
        cognitiveAnalysis: assessment.cognitiveAnalysis,
        timestamp: new Date(),
      });

      // Update learning path based on assessment
      await this.updateLearningPath(request.userId, assessment);

      // Generate recommended exercises if needed
      if (assessment.score < 70) {
        const adaptiveExercise = await this.langflowService.generateAdaptiveExercise(
          request.userId,
          assessment.cognitiveAnalysis,
          exercise.topic
        );
        
        assessment.recommendedExercises = [adaptiveExercise];
      }

      return assessment;
    } catch (error) {
      logger.error('Error assessing answer:', error);
      throw error;
    }
  }

  /**
   * Update learning path based on assessment
   */
  private async updateLearningPath(
    userId: string, 
    assessment: AssessmentResponse
  ): Promise<void> {
    try {
      const learningPath = await this.databaseService.getLearningPath(userId);
      
      // Update struggling concepts
      const strugglingConcepts = new Set(learningPath.strugglingConcepts);
      assessment.cognitiveAnalysis.weaknesses.forEach(w => strugglingConcepts.add(w));
      
      // Update mastered concepts
      const masteredConcepts = new Set(learningPath.masteredConcepts);
      if (assessment.score >= 90) {
        assessment.cognitiveAnalysis.strengths.forEach(s => {
          masteredConcepts.add(s);
          strugglingConcepts.delete(s);
        });
      }

      // Calculate progress
      const totalConcepts = masteredConcepts.size + strugglingConcepts.size;
      const progressPercentage = totalConcepts > 0 
        ? (masteredConcepts.size / totalConcepts) * 100 
        : 0;

      await this.databaseService.updateLearningPath(userId, {
        strugglingConcepts: Array.from(strugglingConcepts),
        masteredConcepts: Array.from(masteredConcepts),
        recommendedNext: assessment.nextSteps,
        progressPercentage,
      });
    } catch (error) {
      logger.error('Error updating learning path:', error);
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string): Promise<GeneratedExercise[]> {
    try {
      const learningPath = await this.databaseService.getLearningPath(userId);
      const recentAttempts = await this.databaseService.getUserAttempts(userId, 10);
      
      // Get recent topics
      const recentTopics = [...new Set(recentAttempts.map(a => a.topic))];
      
      // Get recommendations from Pinecone
      const recommendedContent = await this.pineconeService.getRecommendedContent(
        userId,
        recentTopics,
        learningPath.strugglingConcepts,
        5
      );

      // Convert to exercises
      const exercises: GeneratedExercise[] = [];
      for (const content of recommendedContent) {
        const metadata = content.metadata;
        // Fetch full exercise from database
        const result = await this.databaseService.pool.query(
          'SELECT * FROM generated_exercises WHERE id = $1',
          [metadata.id]
        );
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          exercises.push({
            id: row.id,
            topic: row.topic,
            difficulty: row.difficulty,
            type: row.type,
            question: row.question,
            context: row.context,
            hints: row.hints,
            correctAnswer: row.correct_answer,
            explanation: row.explanation,
            learningObjectives: row.learning_objectives,
            estimatedTime: row.estimated_time,
            metadata: row.metadata,
          });
        }
      }

      return exercises;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user's learning statistics
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const stats = await this.databaseService.getUserStats(userId);
      const learningPath = await this.databaseService.getLearningPath(userId);
      
      return {
        ...stats,
        learningPath,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }
} 