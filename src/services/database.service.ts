import { Pool } from 'pg';
import { DatabaseConfig, ExerciseAttempt, LearningPath } from '../types/content.types.js';
import { logger } from '../utils/logger.js';

export class DatabaseService {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database error:', err);
    });
  }

  /**
   * Initialize database tables
   */
  async initialize(): Promise<void> {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS exercise_attempts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          exercise_id VARCHAR(255) NOT NULL,
          student_answer TEXT NOT NULL,
          correct_answer TEXT NOT NULL,
          score DECIMAL(5,2) NOT NULL,
          cognitive_analysis JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS learning_paths (
          user_id VARCHAR(255) PRIMARY KEY,
          current_topic VARCHAR(255),
          completed_exercises TEXT[],
          mastered_concepts TEXT[],
          struggling_concepts TEXT[],
          recommended_next TEXT[],
          progress_percentage DECIMAL(5,2),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS generated_exercises (
          id VARCHAR(255) PRIMARY KEY,
          topic VARCHAR(255) NOT NULL,
          difficulty VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          question TEXT NOT NULL,
          context TEXT,
          hints TEXT[],
          correct_answer TEXT NOT NULL,
          explanation TEXT NOT NULL,
          learning_objectives TEXT[],
          estimated_time INTEGER,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON exercise_attempts(user_id);
        CREATE INDEX IF NOT EXISTS idx_attempts_exercise_id ON exercise_attempts(exercise_id);
        CREATE INDEX IF NOT EXISTS idx_exercises_topic ON generated_exercises(topic);
        CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON generated_exercises(difficulty);
      `);

      logger.info('Database tables initialized');
    } catch (error) {
      logger.error('Error initializing database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  /**
   * Save exercise attempt
   */
  async saveExerciseAttempt(attempt: ExerciseAttempt & { userId: string }): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO exercise_attempts 
         (user_id, exercise_id, student_answer, correct_answer, score, cognitive_analysis)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          attempt.userId,
          attempt.exerciseId,
          attempt.studentAnswer,
          attempt.correctAnswer,
          attempt.score,
          JSON.stringify(attempt.cognitiveAnalysis),
        ]
      );
    } catch (error) {
      logger.error('Error saving exercise attempt:', error);
      throw new Error('Failed to save exercise attempt');
    }
  }

  /**
   * Get user's recent attempts
   */
  async getUserAttempts(userId: string, limit: number = 10): Promise<ExerciseAttempt[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM exercise_attempts 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows.map(row => ({
        exerciseId: row.exercise_id,
        studentAnswer: row.student_answer,
        correctAnswer: row.correct_answer,
        score: parseFloat(row.score),
        cognitiveAnalysis: row.cognitive_analysis,
        timestamp: row.created_at,
      }));
    } catch (error) {
      logger.error('Error getting user attempts:', error);
      throw new Error('Failed to get user attempts');
    }
  }

  /**
   * Get or create learning path
   */
  async getLearningPath(userId: string): Promise<LearningPath> {
    try {
      let result = await this.pool.query(
        'SELECT * FROM learning_paths WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Create new learning path
        await this.pool.query(
          `INSERT INTO learning_paths 
           (user_id, current_topic, completed_exercises, mastered_concepts, 
            struggling_concepts, recommended_next, progress_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, '', [], [], [], [], 0]
        );

        result = await this.pool.query(
          'SELECT * FROM learning_paths WHERE user_id = $1',
          [userId]
        );
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        currentTopic: row.current_topic || '',
        completedExercises: row.completed_exercises || [],
        masteredConcepts: row.mastered_concepts || [],
        strugglingConcepts: row.struggling_concepts || [],
        recommendedNext: row.recommended_next || [],
        progressPercentage: parseFloat(row.progress_percentage || 0),
      };
    } catch (error) {
      logger.error('Error getting learning path:', error);
      throw new Error('Failed to get learning path');
    }
  }

  /**
   * Update learning path
   */
  async updateLearningPath(userId: string, updates: Partial<LearningPath>): Promise<void> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.currentTopic !== undefined) {
        fields.push(`current_topic = $${paramCount++}`);
        values.push(updates.currentTopic);
      }
      if (updates.completedExercises !== undefined) {
        fields.push(`completed_exercises = $${paramCount++}`);
        values.push(updates.completedExercises);
      }
      if (updates.masteredConcepts !== undefined) {
        fields.push(`mastered_concepts = $${paramCount++}`);
        values.push(updates.masteredConcepts);
      }
      if (updates.strugglingConcepts !== undefined) {
        fields.push(`struggling_concepts = $${paramCount++}`);
        values.push(updates.strugglingConcepts);
      }
      if (updates.recommendedNext !== undefined) {
        fields.push(`recommended_next = $${paramCount++}`);
        values.push(updates.recommendedNext);
      }
      if (updates.progressPercentage !== undefined) {
        fields.push(`progress_percentage = $${paramCount++}`);
        values.push(updates.progressPercentage);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await this.pool.query(
        `UPDATE learning_paths SET ${fields.join(', ')} WHERE user_id = $${paramCount}`,
        values
      );
    } catch (error) {
      logger.error('Error updating learning path:', error);
      throw new Error('Failed to update learning path');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const attemptsResult = await this.pool.query(
        `SELECT 
          COUNT(*) as total_attempts,
          AVG(score) as average_score,
          COUNT(DISTINCT exercise_id) as unique_exercises
         FROM exercise_attempts
         WHERE user_id = $1`,
        [userId]
      );

      const topicsResult = await this.pool.query(
        `SELECT DISTINCT ge.topic, COUNT(*) as count
         FROM exercise_attempts ea
         JOIN generated_exercises ge ON ea.exercise_id = ge.id
         WHERE ea.user_id = $1
         GROUP BY ge.topic
         ORDER BY count DESC
         LIMIT 5`,
        [userId]
      );

      return {
        totalAttempts: parseInt(attemptsResult.rows[0].total_attempts),
        averageScore: parseFloat(attemptsResult.rows[0].average_score || 0),
        uniqueExercises: parseInt(attemptsResult.rows[0].unique_exercises),
        topTopics: topicsResult.rows.map(row => ({
          topic: row.topic,
          count: parseInt(row.count),
        })),
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw new Error('Failed to get user stats');
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
} 