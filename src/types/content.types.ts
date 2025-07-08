export interface ContentGenerationRequest {
  userId: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  previousAttempts?: ExerciseAttempt[];
  focusArea?: string;
}

export interface ExerciseAttempt {
  exerciseId: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  cognitiveAnalysis: CognitiveAnalysis;
  timestamp: Date;
}

export interface CognitiveAnalysis {
  understandingLevel: number; // 0-100
  misconceptions: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedFocus: string[];
  cognitivePattern: string;
}

export interface GeneratedExercise {
  id: string;
  topic: string;
  difficulty: string;
  type: 'multiple-choice' | 'short-answer' | 'problem-solving' | 'essay';
  question: string;
  context?: string;
  hints?: string[];
  correctAnswer: string | string[];
  explanation: string;
  learningObjectives: string[];
  estimatedTime: number; // in minutes
  metadata: {
    createdAt: Date;
    generatedFor: string;
    focusAreas: string[];
  };
}

export interface AssessmentRequest {
  exerciseId: string;
  studentAnswer: string;
  userId: string;
}

export interface AssessmentResponse {
  score: number;
  feedback: string;
  cognitiveAnalysis: CognitiveAnalysis;
  nextSteps: string[];
  recommendedExercises?: GeneratedExercise[];
}

export interface LangflowConfig {
  baseUrl: string;
  flowId: string;
  apiKey: string;
}

export interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface ContentMetadata {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  tags: string[];
  embedding?: number[];
}

export interface LearningPath {
  userId: string;
  currentTopic: string;
  completedExercises: string[];
  masteredConcepts: string[];
  strugglingConcepts: string[];
  recommendedNext: string[];
  progressPercentage: number;
} 