/**
 * RAG Infrastructure Orchestrator
 * Coordinates all services to build the complete RAG pipeline
 */

import { logger } from '../utils/logger.js';
import { TextbookScraper } from './textbook-scraper.js';
import { PDFProcessor } from './pdf-processor.js';
import { ContentChunker } from './content-chunker.js';
import { EmbeddingService } from './embedding-service.js';
import { PineconeService } from './pinecone-service.js';
import { 
  OpenStaxTextbook, 
  TextbookMetadata, 
  ProcessedChunk, 
  EmbeddingResult,
  ProcessingProgress 
} from '../types/index.js';
import { join } from 'path';

interface OrchestrationOptions {
  downloadDirectory: string;
  skipExistingBooks: boolean;
  maxConcurrentProcessing: number;
  enableProgressReporting: boolean;
}

interface OrchestrationResult {
  processedBooks: string[];
  totalChunks: number;
  totalEmbeddings: number;
  indexedVectors: number;
  errors: string[];
  processingTime: number;
  statistics: {
    avgChunksPerBook: number;
    avgChunkSize: number;
    indexingSuccessRate: number;
    totalProcessingTime: number;
  };
}

export class RAGOrchestrator {
  private textbookScraper: TextbookScraper;
  private pdfProcessor: PDFProcessor;
  private contentChunker: ContentChunker;
  private embeddingService: EmbeddingService;
  private pineconeService: PineconeService;
  private options: OrchestrationOptions;

  constructor(options: Partial<OrchestrationOptions> = {}) {
    this.options = {
      downloadDirectory: './downloads',
      skipExistingBooks: true,
      maxConcurrentProcessing: 3,
      enableProgressReporting: true,
      ...options,
    };

    this.textbookScraper = new TextbookScraper({
      downloadDirectory: this.options.downloadDirectory,
    });
    this.pdfProcessor = new PDFProcessor();
    this.contentChunker = new ContentChunker();
    this.embeddingService = new EmbeddingService();
    this.pineconeService = new PineconeService();
  }

  /**
   * Initialize the RAG infrastructure
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    logger.info('Initializing RAG infrastructure');
    
    try {
      // Initialize Pinecone service
      await this.pineconeService.initialize();
      
      logger.info('RAG infrastructure initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RAG infrastructure:', error);
      throw new Error(`RAG initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process recommended textbooks into the RAG system
   * @param progressCallback - Optional progress callback
   * @returns Orchestration result
   */
  async processRecommendedTextbooks(
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<OrchestrationResult> {
    const textbooks = this.textbookScraper.getRecommendedTextbooks();
    return this.processTextbooks(textbooks, progressCallback);
  }

  /**
   * Process custom textbooks into the RAG system
   * @param textbooks - Array of textbooks to process
   * @param progressCallback - Optional progress callback
   * @returns Orchestration result
   */
  async processTextbooks(
    textbooks: OpenStaxTextbook[],
    progressCallback?: (progress: ProcessingProgress) => void
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    logger.info(`Starting RAG processing for ${textbooks.length} textbooks`);

    const processedBooks: string[] = [];
    const errors: string[] = [];
    let totalChunks = 0;
    let totalEmbeddings = 0;
    let indexedVectors = 0;

    try {
      // Step 1: Download textbooks
      this.reportProgress(progressCallback, 'downloading', 0, 'Downloading textbooks...');
      
      const downloadResult = await this.textbookScraper.downloadTextbooks(textbooks);
      errors.push(...downloadResult.errors);
      
      const downloadedBooks = downloadResult.downloadedBooks;
      logger.info(`Downloaded ${downloadedBooks.length} textbooks`);

      // Step 2: Process each textbook
      for (let i = 0; i < downloadedBooks.length; i++) {
        const book = downloadedBooks[i];
        const progress = ((i + 1) / downloadedBooks.length) * 100;
        
        try {
          this.reportProgress(progressCallback, 'extracting', progress, `Processing ${book.title}...`);
          
          const bookResult = await this.processSingleTextbook(book);
          
          processedBooks.push(book.book);
          totalChunks += bookResult.chunks.length;
          totalEmbeddings += bookResult.embeddings.length;
          indexedVectors += bookResult.indexedCount;
          
          logger.info(`Processed ${book.title}: ${bookResult.chunks.length} chunks, ${bookResult.embeddings.length} embeddings`);
        } catch (error) {
          const errorMessage = `Failed to process ${book.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          logger.error(errorMessage);
        }
      }

      this.reportProgress(progressCallback, 'complete', 100, 'Processing complete');
      
    } catch (error) {
      const errorMessage = `RAG processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const processingTime = Date.now() - startTime;
    
    const result: OrchestrationResult = {
      processedBooks,
      totalChunks,
      totalEmbeddings,
      indexedVectors,
      errors,
      processingTime,
      statistics: {
        avgChunksPerBook: processedBooks.length > 0 ? totalChunks / processedBooks.length : 0,
        avgChunkSize: 0, // Will be calculated from chunks
        indexingSuccessRate: totalEmbeddings > 0 ? (indexedVectors / totalEmbeddings) * 100 : 0,
        totalProcessingTime: processingTime,
      },
    };

    logger.info(`RAG processing complete: ${processedBooks.length} books processed, ${totalChunks} chunks, ${indexedVectors} vectors indexed`);
    
    return result;
  }

  /**
   * Process a single textbook through the entire pipeline
   * @param textbook - Textbook metadata
   * @returns Processing result
   */
  private async processSingleTextbook(textbook: TextbookMetadata): Promise<{
    chunks: ProcessedChunk[];
    embeddings: EmbeddingResult[];
    indexedCount: number;
  }> {
    const filePath = join(this.options.downloadDirectory, `${textbook.book}.pdf`);
    
    // Step 1: Extract text from PDF
    const pdfContent = await this.pdfProcessor.processPDF(filePath, textbook);
    
    // Step 2: Chunk the content
    const chunkingResult = await this.contentChunker.chunkContent(pdfContent.text, {
      book: textbook.book,
      title: textbook.title,
      subject: textbook.subject,
    });
    
    // Update total chunks in metadata
    chunkingResult.chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunkingResult.chunks.length;
    });
    
    // Step 3: Generate embeddings
    const embeddings = await this.embeddingService.generateEmbeddings(chunkingResult.chunks);
    
    // Step 4: Index in Pinecone
    const upsertResult = await this.pineconeService.upsertVectors(chunkingResult.chunks, embeddings);
    
    return {
      chunks: chunkingResult.chunks,
      embeddings,
      indexedCount: upsertResult.successCount,
    };
  }

  /**
   * Query the RAG system
   * @param query - Query text
   * @param topK - Number of results to return
   * @param filter - Optional metadata filter
   * @returns Query results
   */
  async query(
    query: string,
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<any[]> {
    try {
      // Generate embedding for query
      const queryChunk = {
        id: 'query',
        text: query,
        metadata: {} as any,
      };
      
      const queryEmbedding = await this.embeddingService.generateSingleEmbedding(queryChunk);
      
      // Query Pinecone
      const results = await this.pineconeService.queryVectors(
        queryEmbedding.embedding,
        topK,
        filter
      );
      
      return results;
    } catch (error) {
      logger.error('Error querying RAG system:', error);
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get system statistics
   * @returns System statistics
   */
  async getSystemStats(): Promise<{
    pineconeStats: any;
    embeddingServiceInfo: any;
    pineconeServiceInfo: any;
  }> {
    try {
      const [pineconeStats, embeddingServiceInfo, pineconeServiceInfo] = await Promise.all([
        this.pineconeService.getIndexStats(),
        this.embeddingService.getServiceInfo(),
        this.pineconeService.getServiceInfo(),
      ]);
      
      return {
        pineconeStats,
        embeddingServiceInfo,
        pineconeServiceInfo,
      };
    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw new Error(`Failed to get system stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all vectors for a specific book
   * @param bookId - Book ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteBook(bookId: string): Promise<void> {
    try {
      // Query for all vectors with this book ID
      const allVectors = await this.pineconeService.queryVectors(
        new Array(1536).fill(0), // Dummy vector
        10000, // Large number to get all vectors
        { book: bookId }
      );
      
      const vectorIds = allVectors.map(v => v.id);
      
      if (vectorIds.length > 0) {
        await this.pineconeService.deleteVectors(vectorIds);
        logger.info(`Deleted ${vectorIds.length} vectors for book: ${bookId}`);
      } else {
        logger.info(`No vectors found for book: ${bookId}`);
      }
    } catch (error) {
      logger.error(`Error deleting book ${bookId}:`, error);
      throw new Error(`Failed to delete book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset the entire RAG system
   * @returns Promise that resolves when reset is complete
   */
  async resetSystem(): Promise<void> {
    try {
      logger.warn('Resetting RAG system - this will delete all data!');
      
      // Delete and recreate the Pinecone index
      await this.pineconeService.deleteIndex();
      await this.pineconeService.initialize();
      
      logger.info('RAG system reset complete');
    } catch (error) {
      logger.error('Error resetting RAG system:', error);
      throw new Error(`Failed to reset system: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Report progress to callback
   * @param callback - Progress callback
   * @param stage - Current stage
   * @param progress - Progress percentage
   * @param message - Progress message
   */
  private reportProgress(
    callback: ((progress: ProcessingProgress) => void) | undefined,
    stage: ProcessingProgress['stage'],
    progress: number,
    message: string
  ): void {
    if (callback && this.options.enableProgressReporting) {
      callback({
        stage,
        progress: Math.min(100, Math.max(0, progress)),
        message,
      });
    }
  }
} 