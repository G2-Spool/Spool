/**
 * Configuration management module
 * Loads and validates environment variables with sensible defaults
 */

import { config } from 'dotenv';
import { z } from 'zod';

config();

const configSchema = z.object({
  // Pinecone Configuration
  PINECONE_API_KEY: z.string().min(1, 'Pinecone API key is required'),
  PINECONE_ENVIRONMENT: z.string().optional(), // Not used in serverless Pinecone
  PINECONE_INDEX_NAME: z.string().default('textbook-embeddings'),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  OPENAI_EMBEDDING_DIMENSIONS: z.number().default(1536),

  // Processing Configuration
  CHUNK_SIZE: z.number().default(1000),
  CHUNK_OVERLAP: z.number().default(200),
  MIN_CHUNK_SIZE: z.number().default(300),
  MAX_CONCURRENT_REQUESTS: z.number().default(5),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

function loadConfig() {
  const rawConfig = {
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_EMBEDDING_DIMENSIONS: process.env.OPENAI_EMBEDDING_DIMENSIONS ? 
      parseInt(process.env.OPENAI_EMBEDDING_DIMENSIONS, 10) : undefined,
    CHUNK_SIZE: process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : undefined,
    CHUNK_OVERLAP: process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : undefined,
    MIN_CHUNK_SIZE: process.env.MIN_CHUNK_SIZE ? parseInt(process.env.MIN_CHUNK_SIZE, 10) : undefined,
    MAX_CONCURRENT_REQUESTS: process.env.MAX_CONCURRENT_REQUESTS ? 
      parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) : undefined,
    LOG_LEVEL: process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | undefined,
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
}

export const appConfig = loadConfig(); 