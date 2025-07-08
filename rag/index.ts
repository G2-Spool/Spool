/**
 * Main entry point for the RAG infrastructure
 * Provides CLI interface and programmatic access to the RAG system
 */

import { RAGOrchestrator } from './services/rag-orchestrator.js';
import { logger } from './utils/logger.js';
import { appConfig } from './config/index.js';

async function main() {
  logger.info('Starting RAG Infrastructure');
  
  try {
    // Initialize the RAG orchestrator
    const orchestrator = new RAGOrchestrator({
      downloadDirectory: './downloads',
      enableProgressReporting: true,
    });
    
    // Initialize the system
    await orchestrator.initialize();
    
    // Process recommended textbooks
    const result = await orchestrator.processRecommendedTextbooks((progress) => {
      logger.info(`${progress.stage}: ${progress.progress.toFixed(1)}% - ${progress.message}`);
    });
    
    // Log final results
    logger.info('RAG Infrastructure Setup Complete!', {
      processedBooks: result.processedBooks.length,
      totalChunks: result.totalChunks,
      totalEmbeddings: result.totalEmbeddings,
      indexedVectors: result.indexedVectors,
      processingTime: `${(result.processingTime / 1000).toFixed(2)}s`,
      errors: result.errors.length,
    });
    
    if (result.errors.length > 0) {
      logger.warn('Some errors occurred during processing:', result.errors);
    }
    
    // Get system statistics
    const stats = await orchestrator.getSystemStats();
    logger.info('System Statistics:', stats);
    
    // Example query
    const queryResults = await orchestrator.query('What is a derivative?', 5);
    logger.info('Sample query results:', queryResults.map(r => ({
      id: r.id,
      score: r.score,
      title: r.metadata?.title,
      subject: r.metadata?.subject,
      text: r.metadata?.text?.substring(0, 100) + '...',
    })));
    
  } catch (error) {
    logger.error('Failed to setup RAG infrastructure:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { RAGOrchestrator }; 