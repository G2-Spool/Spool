#!/usr/bin/env tsx

/**
 * Setup script for RAG infrastructure
 * Interactive script to configure and initialize the RAG system
 */

import { RAGOrchestrator } from '../services/rag-orchestrator.js';
import { TextbookScraper } from '../services/textbook-scraper.js';
import { logger } from '../utils/logger.js';
import { OpenStaxTextbook } from '../types/index.js';

async function setupRAG() {
  console.log('🚀 Setting up RAG Infrastructure for Learning Management System');
  console.log('=' .repeat(60));
  
  try {
    // Initialize orchestrator
    const orchestrator = new RAGOrchestrator({
      downloadDirectory: './downloads',
      enableProgressReporting: true,
    });
    
    // Initialize the system
    console.log('📋 Initializing RAG system...');
    await orchestrator.initialize();
    
    // Show available textbooks
    const scraper = new TextbookScraper();
    const recommendedBooks = scraper.getRecommendedTextbooks();
    
    console.log('\n📚 Available Textbooks:');
    recommendedBooks.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} (${book.subject})`);
    });
    
    // Process all recommended textbooks
    console.log('\n🔄 Processing textbooks...');
    const result = await orchestrator.processRecommendedTextbooks((progress) => {
      const progressBar = '█'.repeat(Math.floor(progress.progress / 5));
      const emptyBar = '░'.repeat(20 - Math.floor(progress.progress / 5));
      console.log(`[${progressBar}${emptyBar}] ${progress.progress.toFixed(1)}% - ${progress.message}`);
    });
    
    // Show results
    console.log('\n✅ RAG Infrastructure Setup Complete!');
    console.log(`📊 Results:`);
    console.log(`   • Books processed: ${result.processedBooks.length}`);
    console.log(`   • Total chunks: ${result.totalChunks}`);
    console.log(`   • Total embeddings: ${result.totalEmbeddings}`);
    console.log(`   • Indexed vectors: ${result.indexedVectors}`);
    console.log(`   • Processing time: ${(result.processingTime / 1000).toFixed(2)}s`);
    
    if (result.errors.length > 0) {
      console.log(`   • Errors: ${result.errors.length}`);
      console.log('⚠️  Some errors occurred:');
      result.errors.forEach(error => console.log(`     - ${error}`));
    }
    
    // Get system statistics
    const stats = await orchestrator.getSystemStats();
    console.log('\n📈 System Statistics:');
    console.log(`   • Index vectors: ${stats.pineconeStats.vectorCount}`);
    console.log(`   • Index size: ${stats.pineconeStats.totalSize}`);
    console.log(`   • Embedding model: ${stats.embeddingServiceInfo.model}`);
    console.log(`   • Vector dimensions: ${stats.embeddingServiceInfo.dimensions}`);
    
    // Test query
    console.log('\n🔍 Testing query functionality...');
    const queryResults = await orchestrator.query('What is a derivative in calculus?', 3);
    
    console.log('Sample query results:');
    queryResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Score: ${result.score?.toFixed(4)} | ${result.metadata?.title || 'Unknown'}`);
      console.log(`      Subject: ${result.metadata?.subject || 'Unknown'}`);
      console.log(`      Text: ${result.metadata?.text?.substring(0, 100) || 'No text'}...`);
    });
    
    console.log('\n🎉 RAG Infrastructure is ready for use!');
    console.log('You can now query the system using the RAGOrchestrator.query() method.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupRAG().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 