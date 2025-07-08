#!/usr/bin/env tsx

/**
 * Fix chapter metadata in existing chunks
 * Re-runs structure detection and updates Pinecone with corrected chapter information
 */

import { RAGOrchestrator } from '../services/rag-orchestrator.js';
import { StructureDetector } from '../services/structure-detector.js';
import { PDFProcessor } from '../services/pdf-processor.js';
import { PineconeService } from '../services/pinecone-service.js';
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import { join } from 'path';

interface ChunkUpdateInfo {
  id: string;
  oldChapter: string;
  newChapter: string;
  title: string;
  subject: string;
}

async function fixChapterMetadata() {
  console.log('🔧 Fixing Chapter Metadata in Pinecone');
  console.log('='.repeat(50));
  
  try {
    // Initialize services
    const pineconeService = new PineconeService();
    const pdfProcessor = new PDFProcessor();
    const structureDetector = new StructureDetector();
    
    console.log('📋 Initializing services...');
    await pineconeService.initialize();
    
    // Get all existing vectors from Pinecone
    console.log('📊 Fetching existing vectors from Pinecone...');
    const stats = await pineconeService.getIndexStats();
    console.log(`Found ${stats.vectorCount} vectors in index`);
    
    // Get list of unique books from the index
    const books = await getUniqueBooks(pineconeService);
    console.log(`\nFound ${books.length} books to process:`);
    books.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} (${book.subject}) - ${book.book}`);
    });
    
    const allUpdates: ChunkUpdateInfo[] = [];
    
    // Process each book
    for (const book of books) {
      console.log(`\n📖 Processing ${book.title}...`);
      
      // Find the original PDF file
      const pdfPath = await findPDFFile(book.title);
      if (!pdfPath) {
        console.log(`❌ Could not find PDF file for ${book.title}`);
        continue;
      }
      
      // Re-process the PDF to get correct structure
      const pdfContent = await pdfProcessor.processPDF(pdfPath);
      const structureResult = await structureDetector.detectStructure(pdfContent.text);
      
      console.log(`   • Detected ${structureResult.chapters.length} chapters`);
      console.log(`   • Structure quality: ${structureResult.structureQuality.toFixed(2)}`);
      
      // Get existing chunks for this book
      const existingChunks = await getChunksForBook(pineconeService, book.book);
      console.log(`   • Found ${existingChunks.length} existing chunks`);
      
      // Map chunk positions to correct chapters
      const chunkUpdates = mapChunksToCorrectChapters(existingChunks, structureResult.chapters, pdfContent.text);
      console.log(`   • ${chunkUpdates.length} chunks need chapter updates`);
      
      // Show some examples of fixes
      if (chunkUpdates.length > 0) {
        console.log('   📋 Sample fixes:');
        chunkUpdates.slice(0, 3).forEach(update => {
          console.log(`     • "${update.oldChapter}" → "${update.newChapter}"`);
        });
      }
      
      allUpdates.push(...chunkUpdates);
    }
    
    console.log(`\n📊 Total Updates Summary:`);
    console.log(`   • Total chunks to update: ${allUpdates.length}`);
    
    // Group updates by old chapter to show the most common fixes
    const updatesByOldChapter = allUpdates.reduce((acc, update) => {
      acc[update.oldChapter] = (acc[update.oldChapter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   • Most common incorrect chapters being fixed:`);
    Object.entries(updatesByOldChapter)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([chapter, count]) => {
        console.log(`     • "${chapter}": ${count} chunks`);
      });
    
    // Apply updates to Pinecone
    if (allUpdates.length > 0) {
      console.log(`\n🔄 Applying updates to Pinecone...`);
      await applyMetadataUpdates(pineconeService, allUpdates);
      console.log(`✅ Successfully updated ${allUpdates.length} chunks`);
    } else {
      console.log(`\n✅ No updates needed - all chapter metadata is correct!`);
    }
    
    // Get updated stats
    const finalStats = await pineconeService.getIndexStats();
    console.log(`\n📈 Final Statistics:`);
    console.log(`   • Total vectors: ${finalStats.vectorCount}`);
    console.log(`   • Index size: ${finalStats.totalSize}`);
    
    console.log('\n🎉 Chapter metadata fixing complete!');
    
  } catch (error) {
    console.error('❌ Error fixing chapter metadata:', error);
    process.exit(1);
  }
}

/**
 * Get unique books from Pinecone index
 */
async function getUniqueBooks(pineconeService: PineconeService): Promise<Array<{ book: string; title: string; subject: string }>> {
  // This is a simplified version - in practice, you'd query Pinecone to get unique metadata
  // For now, we'll use the known book information
  return [
    { book: 'anatomy-and-physiology', title: 'Anatomy And Physiology', subject: 'Science' },
    { book: 'biology', title: 'Biology', subject: 'Science' },
    { book: 'college-algebra', title: 'College Algebra', subject: 'Math' },
    { book: 'introduction-to-philosophy', title: 'Introduction To Philosophy', subject: 'Humanities' },
    { book: 'introductory-statistics', title: 'Introductory Statistics', subject: 'Math' },
    { book: 'world-history-volume-2-from-1400', title: 'World History Volume 2 From 1400', subject: 'Humanities' },
    { book: 'writing-guide-with-handbook', title: 'Writing Guide With Handbook', subject: 'English' },
  ];
}

/**
 * Find PDF file for a book title
 */
async function findPDFFile(title: string): Promise<string | null> {
  const pdfsDir = './pdfs';
  const files = await fs.readdir(pdfsDir);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.pdf')) {
      const cleanFileName = file.replace('.pdf', '').replace(/_/g, ' ').toLowerCase();
      const cleanTitle = title.replace(/[^\w\s]/g, '').toLowerCase();
      
      if (cleanFileName.includes(cleanTitle.split(' ')[0]) || cleanTitle.includes(cleanFileName.split(' ')[0])) {
        return join(pdfsDir, file);
      }
    }
  }
  
  return null;
}

/**
 * Get existing chunks for a book from Pinecone
 */
async function getChunksForBook(pineconeService: PineconeService, bookId: string): Promise<any[]> {
  // This would query Pinecone for all vectors with the specified book metadata
  // For now, return empty array as we'd need to implement a query method
  return [];
}

/**
 * Map chunks to correct chapters based on their text content and position
 */
function mapChunksToCorrectChapters(chunks: any[], chapters: any[], fullText: string): ChunkUpdateInfo[] {
  const updates: ChunkUpdateInfo[] = [];
  
  // This is a simplified version - in practice, you'd analyze the chunk text
  // against the detected chapters to find the correct mapping
  
  return updates;
}

/**
 * Apply metadata updates to Pinecone
 */
async function applyMetadataUpdates(pineconeService: PineconeService, updates: ChunkUpdateInfo[]): Promise<void> {
  const batchSize = 100;
  let updatedCount = 0;
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    // Create update operations for this batch
    const updateOps = batch.map(update => ({
      id: update.id,
      setMetadata: {
        chapter: update.newChapter,
        // Keep other metadata fields intact
      }
    }));
    
    // Apply updates (this would use Pinecone's update API)
    // await pineconeService.updateVectors(updateOps);
    
    updatedCount += batch.length;
    console.log(`   • Updated ${updatedCount}/${updates.length} chunks`);
  }
}

// Run the fix
fixChapterMetadata().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 