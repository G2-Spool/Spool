/**
 * OpenAI embedding service for generating vector embeddings
 * Handles batch processing and rate limiting for efficient embedding generation
 */

import OpenAI from 'openai';
import pLimit from 'p-limit';
import { logger } from '../utils/logger.js';
import { appConfig } from '../config/index.js';
import { ProcessedChunk, EmbeddingResult } from '../types/index.js';

interface EmbeddingOptions {
  model: string;
  dimensions: number;
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
}

interface EmbeddingStats {
  totalChunks: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  totalTokens: number;
  processingTime: number;
  averageTokensPerChunk: number;
}

export class EmbeddingService {
  private openai: OpenAI;
  private options: EmbeddingOptions;
  private limiter: (fn: () => Promise<any>) => Promise<any>;

  constructor(options: Partial<EmbeddingOptions> = {}) {
    this.openai = new OpenAI({
      apiKey: appConfig.OPENAI_API_KEY,
    });

    this.options = {
      model: appConfig.OPENAI_EMBEDDING_MODEL,
      dimensions: appConfig.OPENAI_EMBEDDING_DIMENSIONS,
      batchSize: 100, // OpenAI allows up to 2048 inputs per request
      maxRetries: 3,
      retryDelay: 1000,
      ...options,
    };

    // Rate limiting to respect OpenAI's rate limits
    this.limiter = pLimit(appConfig.MAX_CONCURRENT_REQUESTS);
  }

  /**
   * Generate embeddings for an array of text chunks
   * @param chunks - Array of processed chunks
   * @returns Array of embedding results
   */
  async generateEmbeddings(chunks: ProcessedChunk[]): Promise<EmbeddingResult[]> {
    const startTime = Date.now();
    logger.info(`Starting embedding generation for ${chunks.length} chunks`);

    const results: EmbeddingResult[] = [];
    const errors: Array<{ chunk: ProcessedChunk; error: string }> = [];

    // Process chunks in batches
    const batches = this.createBatches(chunks, this.options.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} chunks)`);

      try {
        const batchResults = await this.limiter(() => this.processBatch(batch));
        results.push(...batchResults);
        
        // Small delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await this.delay(100);
        }
      } catch (error) {
        logger.error(`Error processing batch ${i + 1}:`, error);
        
        // Try to process individual chunks in the failed batch
        const individualResults = await this.processIndividualChunks(batch);
        results.push(...individualResults.results);
        errors.push(...individualResults.errors);
      }
    }

    const processingTime = Date.now() - startTime;
    const stats: EmbeddingStats = {
      totalChunks: chunks.length,
      successfulEmbeddings: results.length,
      failedEmbeddings: errors.length,
      totalTokens: results.reduce((sum, r) => sum + this.estimateTokens(r.chunkId), 0),
      processingTime,
      averageTokensPerChunk: results.length > 0 ? 
        results.reduce((sum, r) => sum + this.estimateTokens(r.chunkId), 0) / results.length : 0,
    };

    this.logStats(stats);
    
    if (errors.length > 0) {
      logger.warn(`${errors.length} chunks failed to generate embeddings`);
      errors.forEach(error => {
        logger.error(`Failed chunk ${error.chunk.id}: ${error.error}`);
      });
    }

    return results;
  }

  /**
   * Generate embedding for a single text chunk
   * @param chunk - Text chunk to embed
   * @returns Embedding result
   */
  async generateSingleEmbedding(chunk: ProcessedChunk): Promise<EmbeddingResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.openai.embeddings.create({
        model: this.options.model,
        input: chunk.text,
        dimensions: this.options.dimensions,
      });

      const embedding = response.data[0].embedding;
      
      return {
        chunkId: chunk.id,
        embedding,
        model: this.options.model,
        dimensions: this.options.dimensions,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error(`Error generating embedding for chunk ${chunk.id}:`, error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a batch of chunks
   * @param chunks - Chunks to process
   * @returns Array of embedding results
   */
  private async processBatch(chunks: ProcessedChunk[]): Promise<EmbeddingResult[]> {
    const startTime = Date.now();
    
    const texts = chunks.map(chunk => chunk.text);
    const chunkIds = chunks.map(chunk => chunk.id);

    let response: OpenAI.Embeddings.CreateEmbeddingResponse;
    
    try {
      response = await this.openai.embeddings.create({
        model: this.options.model,
        input: texts,
        dimensions: this.options.dimensions,
      });
    } catch (error) {
      logger.error('Error in batch embedding request:', error);
      throw error;
    }

    const results: EmbeddingResult[] = [];
    
    for (let i = 0; i < response.data.length; i++) {
      const embedding = response.data[i].embedding;
      const chunkId = chunkIds[i];
      
      results.push({
        chunkId,
        embedding,
        model: this.options.model,
        dimensions: this.options.dimensions,
        processingTime: Date.now() - startTime,
      });
    }

    return results;
  }

  /**
   * Process individual chunks when batch processing fails
   * @param chunks - Chunks to process individually
   * @returns Results and errors
   */
  private async processIndividualChunks(chunks: ProcessedChunk[]): Promise<{
    results: EmbeddingResult[];
    errors: Array<{ chunk: ProcessedChunk; error: string }>;
  }> {
    const results: EmbeddingResult[] = [];
    const errors: Array<{ chunk: ProcessedChunk; error: string }> = [];

    for (const chunk of chunks) {
      try {
        const result = await this.generateSingleEmbedding(chunk);
        results.push(result);
      } catch (error) {
        errors.push({
          chunk,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // Small delay between individual requests
      await this.delay(50);
    }

    return { results, errors };
  }

  /**
   * Create batches of chunks for processing
   * @param chunks - Chunks to batch
   * @param batchSize - Size of each batch
   * @returns Array of batches
   */
  private createBatches<T>(chunks: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      batches.push(chunks.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Retry mechanism for failed requests
   * @param fn - Function to retry
   * @param maxRetries - Maximum number of retries
   * @param delay - Delay between retries
   * @returns Promise result
   */
  private async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.options.maxRetries,
    delay: number = this.options.retryDelay
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms: ${lastError.message}`);
        await this.delay(waitTime);
      }
    }
    
    throw lastError!;
  }

  /**
   * Estimate token count for a piece of text
   * @param text - Text to estimate
   * @returns Estimated token count
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Create a delay for rate limiting
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log embedding statistics
   * @param stats - Embedding statistics
   */
  private logStats(stats: EmbeddingStats): void {
    logger.info('Embedding generation statistics:', {
      totalChunks: stats.totalChunks,
      successfulEmbeddings: stats.successfulEmbeddings,
      failedEmbeddings: stats.failedEmbeddings,
      successRate: `${((stats.successfulEmbeddings / stats.totalChunks) * 100).toFixed(2)}%`,
      totalTokens: stats.totalTokens,
      averageTokensPerChunk: Math.round(stats.averageTokensPerChunk),
      processingTime: `${(stats.processingTime / 1000).toFixed(2)}s`,
      chunksPerSecond: Math.round(stats.totalChunks / (stats.processingTime / 1000)),
    });
  }

  /**
   * Validate embedding dimensions
   * @param embedding - Embedding to validate
   * @returns True if valid
   */
  validateEmbedding(embedding: number[]): boolean {
    return (
      Array.isArray(embedding) &&
      embedding.length === this.options.dimensions &&
      embedding.every(val => typeof val === 'number' && !isNaN(val))
    );
  }

  /**
   * Get embedding service information
   * @returns Service information
   */
  getServiceInfo(): {
    model: string;
    dimensions: number;
    batchSize: number;
    maxConcurrency: number;
  } {
    return {
      model: this.options.model,
      dimensions: this.options.dimensions,
      batchSize: this.options.batchSize,
      maxConcurrency: appConfig.MAX_CONCURRENT_REQUESTS,
    };
  }
} 