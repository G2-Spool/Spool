/**
 * Pinecone service for vector database operations
 * Handles index creation, vector upsertion, and query operations
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '../utils/logger.js';
import { appConfig } from '../config/index.js';
import { 
  ProcessedChunk, 
  EmbeddingResult, 
  PineconeVector, 
  PineconeMetadata 
} from '../types/index.js';

interface PineconeServiceOptions {
  indexName: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  replicas: number;
  environment?: string; // Optional - not used in serverless setup
  batchSize: number;
}

interface IndexStats {
  vectorCount: number;
  indexSize: number;
  dimension: number;
  totalSize: string;
}

interface UpsertResult {
  successCount: number;
  failedCount: number;
  processingTime: number;
  errors: string[];
}

export class PineconeService {
  private pinecone: Pinecone;
  private options: PineconeServiceOptions;
  private indexName: string;

  constructor(options: Partial<PineconeServiceOptions> = {}) {
    this.options = {
      indexName: appConfig.PINECONE_INDEX_NAME,
      dimension: appConfig.OPENAI_EMBEDDING_DIMENSIONS,
      metric: 'cosine',
      replicas: 1,
      environment: appConfig.PINECONE_ENVIRONMENT || 'serverless',
      batchSize: 100,
      ...options,
    };

    this.indexName = this.options.indexName;
    
    this.pinecone = new Pinecone({
      apiKey: appConfig.PINECONE_API_KEY,
    });
  }

  /**
   * Initialize Pinecone service and create index if it doesn't exist
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Pinecone service');
    
    try {
      // Check if index exists
      const indexExists = await this.indexExists();
      
      if (!indexExists) {
        logger.info(`Creating new Pinecone index: ${this.indexName}`);
        await this.createIndex();
      } else {
        logger.info(`Using existing Pinecone index: ${this.indexName}`);
      }
      
      // Wait for index to be ready
      await this.waitForIndexReady();
      
      logger.info('Pinecone service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Pinecone service:', error);
      throw new Error(`Pinecone initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new Pinecone index
   * @returns Promise that resolves when index is created
   */
  async createIndex(): Promise<void> {
    try {
      await this.pinecone.createIndex({
        name: this.indexName,
        dimension: this.options.dimension,
        metric: this.options.metric,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      logger.info(`Index ${this.indexName} created successfully`);
    } catch (error) {
      logger.error(`Error creating index ${this.indexName}:`, error);
      throw error;
    }
  }

  /**
   * Check if index exists
   * @returns Promise that resolves to true if index exists
   */
  async indexExists(): Promise<boolean> {
    try {
      const indexList = await this.pinecone.listIndexes();
      return indexList.indexes?.some(index => index.name === this.indexName) || false;
    } catch (error) {
      logger.error('Error checking if index exists:', error);
      return false;
    }
  }

  /**
   * Wait for index to be ready
   * @param maxWaitTime - Maximum wait time in milliseconds
   * @returns Promise that resolves when index is ready
   */
  async waitForIndexReady(maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const indexDescription = await this.pinecone.describeIndex(this.indexName);
        
        if (indexDescription.status?.ready) {
          logger.info(`Index ${this.indexName} is ready`);
          return;
        }
        
        logger.info(`Waiting for index ${this.indexName} to be ready...`);
        await this.delay(2000);
      } catch (error) {
        logger.error('Error checking index status:', error);
        await this.delay(2000);
      }
    }
    
    throw new Error(`Index ${this.indexName} did not become ready within ${maxWaitTime}ms`);
  }

  /**
   * Upsert vectors to Pinecone index
   * @param chunks - Processed chunks
   * @param embeddings - Corresponding embeddings
   * @returns Upsert result
   */
  async upsertVectors(chunks: ProcessedChunk[], embeddings: EmbeddingResult[]): Promise<UpsertResult> {
    const startTime = Date.now();
    logger.info(`Upserting ${chunks.length} vectors to Pinecone index`);

    // Create embedding map for efficient lookup
    const embeddingMap = new Map<string, number[]>();
    embeddings.forEach(embedding => {
      embeddingMap.set(embedding.chunkId, embedding.embedding);
    });

    // Create vectors for upsert
    const vectors: PineconeVector[] = [];
    const errors: string[] = [];

    for (const chunk of chunks) {
      const embedding = embeddingMap.get(chunk.id);
      
      if (!embedding) {
        errors.push(`No embedding found for chunk ${chunk.id}`);
        continue;
      }

      try {
        const vector = this.createPineconeVector(chunk, embedding);
        vectors.push(vector);
      } catch (error) {
        errors.push(`Error creating vector for chunk ${chunk.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (vectors.length === 0) {
      return {
        successCount: 0,
        failedCount: chunks.length,
        processingTime: Date.now() - startTime,
        errors,
      };
    }

    // Upsert vectors in batches
    const batches = this.createBatches(vectors, this.options.batchSize);
    let successCount = 0;
    let failedCount = 0;

    const index = this.pinecone.index(this.indexName);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        await index.upsert(batch as any);
        successCount += batch.length;
        logger.info(`Upserted batch ${i + 1}/${batches.length} (${batch.length} vectors)`);
      } catch (error) {
        failedCount += batch.length;
        const errorMessage = `Failed to upsert batch ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

    const result: UpsertResult = {
      successCount,
      failedCount,
      processingTime: Date.now() - startTime,
      errors,
    };

    logger.info(`Upsert complete: ${successCount} successful, ${failedCount} failed, ${result.processingTime}ms`);
    
    return result;
  }

  /**
   * Query vectors from Pinecone index
   * @param queryVector - Query vector
   * @param topK - Number of top results to return
   * @param filter - Optional metadata filter
   * @returns Query results
   */
  async queryVectors(
    queryVector: number[],
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<any[]> {
    try {
      const index = this.pinecone.index(this.indexName);
      
      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        filter,
        includeMetadata: true,
        includeValues: false,
      });

      return queryResponse.matches || [];
    } catch (error) {
      logger.error('Error querying vectors:', error);
      throw new Error(`Vector query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get index statistics
   * @returns Index statistics
   */
  async getIndexStats(): Promise<IndexStats> {
    try {
      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();
      
      return {
        vectorCount: stats.totalRecordCount || 0,
        indexSize: stats.indexFullness || 0,
        dimension: this.options.dimension,
        totalSize: `${((stats.totalRecordCount || 0) * this.options.dimension * 4 / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      logger.error('Error getting index stats:', error);
      throw new Error(`Failed to get index stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete vectors from index
   * @param ids - Vector IDs to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteVectors(ids: string[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      
      // Delete in batches
      const batches = this.createBatches(ids, this.options.batchSize);
      
      for (const batch of batches) {
        await index.deleteMany(batch);
      }
      
      logger.info(`Deleted ${ids.length} vectors from index`);
    } catch (error) {
      logger.error('Error deleting vectors:', error);
      throw new Error(`Vector deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all vectors from the index
   * @returns Promise that resolves when all vectors are deleted
   */
  async clearIndex(): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteAll();
      logger.info(`All vectors cleared from index ${this.indexName}`);
    } catch (error) {
      logger.error(`Error clearing index ${this.indexName}:`, error);
      throw error;
    }
  }

  /**
   * Delete entire index
   * @returns Promise that resolves when index is deleted
   */
  async deleteIndex(): Promise<void> {
    try {
      await this.pinecone.deleteIndex(this.indexName);
      logger.info(`Index ${this.indexName} deleted successfully`);
    } catch (error) {
      logger.error(`Error deleting index ${this.indexName}:`, error);
      throw error;
    }
  }

  /**
   * Create a Pinecone vector from chunk and embedding
   * @param chunk - Processed chunk
   * @param embedding - Embedding vector
   * @returns Pinecone vector
   */
  private createPineconeVector(chunk: ProcessedChunk, embedding: number[]): PineconeVector {
    // Convert chunk metadata to Pinecone-compatible format
    const metadata: PineconeMetadata = {
      book: chunk.metadata.book,
      title: chunk.metadata.title,
      subject: chunk.metadata.subject,
      chunkId: chunk.metadata.chunkId,
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
      contentType: chunk.metadata.contentType,
      text: chunk.text.substring(0, 40000), // Pinecone metadata size limit
    };

    // Add optional fields if they exist
    if (chunk.metadata.chapter) {
      metadata.chapter = chunk.metadata.chapter;
    }
    if (chunk.metadata.section) {
      metadata.section = chunk.metadata.section;
    }
    if (chunk.metadata.keywords) {
      metadata.keywords = chunk.metadata.keywords;
    }
    if (chunk.metadata.pageNumbers) {
      metadata.pageNumbers = chunk.metadata.pageNumbers.map(String);
    }
    if (chunk.metadata.difficulty) {
      metadata.difficulty = chunk.metadata.difficulty;
    }

    return {
      id: chunk.id,
      values: embedding,
      metadata,
    };
  }

  /**
   * Create batches for processing
   * @param items - Items to batch
   * @param batchSize - Size of each batch
   * @returns Array of batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Create a delay
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service information
   * @returns Service configuration
   */
  getServiceInfo(): {
    indexName: string;
    dimension: number;
    metric: string;
    environment: string;
    batchSize: number;
  } {
    return {
      indexName: this.options.indexName,
      dimension: this.options.dimension,
      metric: this.options.metric,
      environment: this.options.environment || 'serverless',
      batchSize: this.options.batchSize,
    };
  }
} 