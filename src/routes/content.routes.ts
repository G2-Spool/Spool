import { Router } from 'express';
import { z } from 'zod';
import { ContentService } from '../services/content.service.js';
import { LangflowService } from '../integrations/langflow.service.js';
import { PineconeService } from '../integrations/pinecone.service.js';
import { DatabaseService } from '../services/database.service.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

// Initialize services
const langflowService = new LangflowService({
  baseUrl: process.env.LANGFLOW_BASE_URL || 'http://localhost:7860',
  flowId: process.env.LANGFLOW_FLOW_ID!,
  apiKey: process.env.LANGFLOW_API_KEY!,
});

const pineconeService = new PineconeService({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
  indexName: process.env.PINECONE_INDEX_NAME || 'spool-content',
});

const databaseService = new DatabaseService({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'spool',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD!,
});

const contentService = new ContentService(
  langflowService,
  pineconeService,
  databaseService
);

// Create router
export const contentRouter = Router();

// Validation schemas
const generateExerciseSchema = z.object({
  body: z.object({
    topic: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    learningObjectives: z.array(z.string()),
    focusArea: z.string().optional(),
  }),
});

const assessAnswerSchema = z.object({
  body: z.object({
    exerciseId: z.string(),
    studentAnswer: z.string(),
  }),
});

/**
 * POST /content/generate-exercise
 * Generate a new exercise for the user
 */
contentRouter.post('/generate-exercise',
  authenticate,
  validateRequest(generateExerciseSchema),
  async (req: any, res) => {
    try {
      const exercise = await contentService.generateExercise({
        userId: req.user.sub,
        ...req.body,
      });

      res.json({
        success: true,
        exercise,
      });
    } catch (error) {
      logger.error('Generate exercise route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate exercise',
      });
    }
  }
);

/**
 * POST /content/assess-answer
 * Assess a student's answer
 */
contentRouter.post('/assess-answer',
  authenticate,
  validateRequest(assessAnswerSchema),
  async (req: any, res) => {
    try {
      const assessment = await contentService.assessAnswer({
        userId: req.user.sub,
        ...req.body,
      });

      res.json({
        success: true,
        assessment,
      });
    } catch (error) {
      logger.error('Assess answer route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assess answer',
      });
    }
  }
);

/**
 * GET /content/recommendations
 * Get personalized exercise recommendations
 */
contentRouter.get('/recommendations',
  authenticate,
  async (req: any, res) => {
    try {
      const recommendations = await contentService.getRecommendations(req.user.sub);

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      logger.error('Get recommendations route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendations',
      });
    }
  }
);

/**
 * GET /content/stats
 * Get user's learning statistics
 */
contentRouter.get('/stats',
  authenticate,
  async (req: any, res) => {
    try {
      const stats = await contentService.getUserStats(req.user.sub);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Get stats route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
      });
    }
  }
);

/**
 * GET /content/learning-path
 * Get user's learning path
 */
contentRouter.get('/learning-path',
  authenticate,
  async (req: any, res) => {
    try {
      const learningPath = await databaseService.getLearningPath(req.user.sub);

      res.json({
        success: true,
        learningPath,
      });
    } catch (error) {
      logger.error('Get learning path route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get learning path',
      });
    }
  }
);

/**
 * POST /content/learning-path/update
 * Update user's learning path
 */
contentRouter.post('/learning-path/update',
  authenticate,
  async (req: any, res) => {
    try {
      await databaseService.updateLearningPath(req.user.sub, req.body);

      res.json({
        success: true,
        message: 'Learning path updated',
      });
    } catch (error) {
      logger.error('Update learning path route error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update learning path',
      });
    }
  }
); 