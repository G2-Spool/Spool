import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { contentRouter } from './routes/content.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/logging.middleware.js';
import { logger } from './utils/logger.js';
import { DatabaseService } from './services/database.service.js';
import { PineconeService } from './integrations/pinecone.service.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'spool-content-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/content', contentRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize services on startup
async function initialize() {
  try {
    // Initialize database
    const databaseService = new DatabaseService({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'spool',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD!,
    });
    
    await databaseService.initialize();
    logger.info('Database initialized');

    // Initialize Pinecone
    const pineconeService = new PineconeService({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
      indexName: process.env.PINECONE_INDEX_NAME || 'spool-content',
    });
    
    await pineconeService.initialize();
    logger.info('Pinecone initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Content service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start the service
initialize(); 