#!/usr/bin/env tsx

/**
 * Debug metadata script
 * Examines chapter and section metadata in chunks to identify issues
 */

import { PineconeService } from '../services/pinecone-service.js';
import { logger } from '../utils/logger.js';

interface ChunkMetadata {
  book: string;
  subject: string;
  chapter: string;
  section: string;
  title: string;
  chunkIndex: number;
  totalChunks: number;
}

async function debugMetadata() {
  console.log('🔍 Debug Metadata: Examining Chapter and Section Assignments');
  console.log('='.repeat(65));
  
  try {
    const pineconeService = new PineconeService();
    
    // Query for anatomy and physiology chunks
    const results = await pineconeService.queryVectors(
      new Array(1536).fill(0), // Dummy vector
      100, // topK
      { book: 'anatomy-and-physiology' } // filter
    );
    
    console.log(`📊 Found ${results.length} chunks from Anatomy and Physiology`);
    console.log();
    
    // Analyze chapter distribution
    const chapterCounts = new Map<string, number>();
    const sectionCounts = new Map<string, number>();
    const sectionsByChapter = new Map<string, Set<string>>();
    
    for (const match of results) {
      const metadata = match.metadata as ChunkMetadata;
      
      // Count chapters
      chapterCounts.set(metadata.chapter, (chapterCounts.get(metadata.chapter) || 0) + 1);
      
      // Count sections
      sectionCounts.set(metadata.section, (sectionCounts.get(metadata.section) || 0) + 1);
      
      // Track sections by chapter
      if (!sectionsByChapter.has(metadata.chapter)) {
        sectionsByChapter.set(metadata.chapter, new Set());
      }
      sectionsByChapter.get(metadata.chapter)!.add(metadata.section);
    }
    
    // Show top chapters
    console.log('📚 Top 10 Chapters:');
    const sortedChapters = Array.from(chapterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [chapter, count] of sortedChapters) {
      console.log(`   ${chapter}: ${count} chunks`);
    }
    console.log();
    
    // Show top sections
    console.log('📑 Top 10 Sections:');
    const sortedSections = Array.from(sectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [section, count] of sortedSections) {
      console.log(`   ${section}: ${count} chunks`);
    }
    console.log();
    
    // Show sample good vs bad examples
    console.log('✅ Good Examples (Descriptive chapters and sections):');
    let goodCount = 0;
    for (const match of results) {
      const metadata = match.metadata as ChunkMetadata;
      
      // Look for good examples (handle undefined values)
      if ((metadata.chapter && (metadata.chapter.includes('Level of Organization') || 
           metadata.chapter.includes('Tissue'))) ||
          (metadata.section && (metadata.section.includes('Chemical Bonds') ||
           metadata.section.includes('Types of Tissues')))) {
        console.log(`   Chapter: "${metadata.chapter}" | Section: "${metadata.section}"`);
        goodCount++;
        if (goodCount >= 5) break;
      }
    }
    console.log();
    
    console.log('❌ Problem Examples (Generic or unclear metadata):');
    let problemCount = 0;
    for (const match of results) {
      const metadata = match.metadata as ChunkMetadata;
      
      // Look for problem examples (handle undefined values)
      if (metadata.chapter === 'Chapter 2' || 
          metadata.chapter === 'Chapter 1' ||
          metadata.section === 'Unknown' ||
          metadata.section === undefined ||
          metadata.chapter === undefined ||
          (metadata.section && metadata.section.length < 4)) {
        console.log(`   Chapter: "${metadata.chapter}" | Section: "${metadata.section}"`);
        problemCount++;
        if (problemCount >= 5) break;
      }
    }
    console.log();
    
    // Show specific examples with text
    console.log('🔍 Sample Chunks with Context:');
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const match = results[i];
      const metadata = match.metadata as ChunkMetadata;
      
      console.log(`\n${i + 1}. ID: ${match.id}`);
      console.log(`   Chapter: "${metadata.chapter}"`);
      console.log(`   Section: "${metadata.section}"`);
      console.log(`   Title: "${metadata.title}"`);
      console.log(`   Text Preview: "${(metadata as any).text?.substring(0, 100) || 'N/A'}..."`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugMetadata().catch(console.error); 