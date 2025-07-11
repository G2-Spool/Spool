#!/usr/bin/env tsx

/**
 * Interactive query script for RAG system
 * Allows users to query the RAG system from the command line
 */

import { RAGOrchestrator } from '../services/rag-orchestrator.js';
import { logger } from '../utils/logger.js';

/**
 * Convert cosine similarity score to qualitative match assessment
 * @param score - Cosine similarity score (0-1)
 * @returns Quality label that accurately represents match strength for RAG context
 */
function cosineToQuality(score: number): string {
  if (score >= 0.7) return "Excellent Match";
  if (score >= 0.6) return "Very Good Match"; 
  if (score >= 0.5) return "Good Match";
  if (score >= 0.4) return "Okay Match";
  if (score >= 0.3) return "Weak Match";
  return "Poor Match";
}

async function queryRAG() {
  console.log('🔍 RAG System Query Interface');
  console.log('=' .repeat(40));
  
  try {
    // Initialize orchestrator
    const orchestrator = new RAGOrchestrator();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: npm run query "your question here"');
      console.log('Example: npm run query "What is the derivative of x^2?"');
      process.exit(1);
    }
    
    const query = args.join(' ');
    const topK = parseInt(args[args.length - 1]) || 5;
    
    console.log(`Query: "${query}"`);
    console.log(`Retrieving top ${topK} results...\n`);
    
    // Perform query
    const results = await orchestrator.query(query, topK);
    
    if (results.length === 0) {
      console.log('No results found for your query.');
      return;
    }
    
    console.log(`Found ${results.length} results:\n`);
    
    results.forEach((result, index) => {
      const qualityLabel = cosineToQuality(result.score || 0);
      
      console.log(`${index + 1}. Score: ${result.score?.toFixed(4)} (${qualityLabel})`);
      console.log(`   Book: ${result.metadata?.title || 'Unknown'}`);
      console.log(`   Subject: ${result.metadata?.subject || 'Unknown'}`);
      console.log(`   Chapter: ${result.metadata?.chapter || 'Unknown'}`);
      console.log(`   Section: ${result.metadata?.section || 'Unknown'}`);
      console.log(`   Content Type: ${result.metadata?.contentType || 'Unknown'}`);
      console.log(`   Text: ${result.metadata?.text?.substring(0, 200) || 'No text'}...`);
      console.log(`   Keywords: ${result.metadata?.keywords?.join(', ') || 'None'}`);
      console.log('-'.repeat(60));
    });
    
    // Get system stats
    const stats = await orchestrator.getSystemStats();
    console.log(`\n📊 System Info:`);
    console.log(`   Total vectors: ${stats.pineconeStats.vectorCount}`);
    console.log(`   Index size: ${stats.pineconeStats.totalSize}`);
    
  } catch (error) {
    console.error('❌ Query failed:', error);
    process.exit(1);
  }
}

// Run the query
queryRAG().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 