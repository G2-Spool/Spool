#!/usr/bin/env tsx

/**
 * Clean reprocess script
 * Clears the Pinecone index and reprocesses all PDFs with improved structure detection
 */

import { RAGOrchestrator } from '../services/rag-orchestrator.js';
import { PineconeService } from '../services/pinecone-service.js';
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import { join } from 'path';

interface LocalPDFInfo {
  filename: string;
  title: string;
  subject: string;
  filePath: string;
  fileSize: number;
}

async function cleanReprocessPDFs() {
  console.log('🧹 Clean Reprocess: Starting Fresh with Improved Structure Detection');
  console.log('='.repeat(70));
  
  try {
    // Initialize services
    console.log('📋 Initializing services...');
    const pineconeService = new PineconeService();
    await pineconeService.initialize();
    
    // Clear the existing index
    console.log('🗑️  Clearing existing vectors from Pinecone index...');
    await pineconeService.clearIndex();
    
    // Wait a moment for the operation to complete
    console.log('⏳ Waiting for index to be cleared...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify the index is empty
    const stats = await pineconeService.getIndexStats();
    console.log(`✅ Index cleared. Current vector count: ${stats.vectorCount}`);
    
    // Initialize orchestrator for reprocessing
    const orchestrator = new RAGOrchestrator({
      downloadDirectory: './pdfs',
      enableProgressReporting: true,
    });
    
    console.log('📋 Initializing RAG system...');
    await orchestrator.initialize();
    
    // Get local PDF files
    const pdfFiles = await getLocalPDFs();
    
    if (pdfFiles.length === 0) {
      console.log('❌ No PDF files found in ./pdfs directory');
      process.exit(1);
    }
    
    console.log('\n📚 Found PDF Textbooks:');
    pdfFiles.forEach((pdf, index) => {
      console.log(`  ${index + 1}. ${pdf.title} (${pdf.subject}) - ${formatBytes(pdf.fileSize)}`);
    });
    
    // Process each PDF with improved structure detection
    console.log('\n🔄 Processing PDFs with Improved Structure Detection...');
    const processedBooks: string[] = [];
    const errors: string[] = [];
    let totalChunks = 0;
    let totalEmbeddings = 0;
    let indexedVectors = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const pdf = pdfFiles[i];
      const progress = ((i + 1) / pdfFiles.length) * 100;
      
      try {
        console.log(`\n📖 Processing ${pdf.title}...`);
        const progressBar = '█'.repeat(Math.floor(progress / 5));
        const emptyBar = '░'.repeat(20 - Math.floor(progress / 5));
        console.log(`[${progressBar}${emptyBar}] ${progress.toFixed(1)}%`);
        
        const bookResult = await processLocalPDF(pdf);
        
        processedBooks.push(pdf.filename);
        totalChunks += bookResult.chunks.length;
        totalEmbeddings += bookResult.embeddings.length;
        indexedVectors += bookResult.indexedCount;
        
        console.log(`✅ ${pdf.title}: ${bookResult.chunks.length} chunks, ${bookResult.embeddings.length} embeddings`);
      } catch (error) {
        const errorMessage = `Failed to process ${pdf.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // Show final results
    console.log('\n✅ Clean Reprocessing Complete!');
    console.log(`📊 Results:`);
    console.log(`   • Books processed: ${processedBooks.length}`);
    console.log(`   • Total chunks: ${totalChunks}`);
    console.log(`   • Total embeddings: ${totalEmbeddings}`);
    console.log(`   • Indexed vectors: ${indexedVectors}`);
    console.log(`   • Processing time: ${(processingTime / 1000).toFixed(2)}s`);
    
    if (errors.length > 0) {
      console.log(`   • Errors: ${errors.length}`);
      console.log('⚠️  Some errors occurred:');
      errors.forEach(error => console.log(`     - ${error}`));
    }
    
    // Get final system statistics
    const finalStats = await orchestrator.getSystemStats();
    console.log('\n📈 Final System Statistics:');
    console.log(`   • Index vectors: ${finalStats.pineconeStats.vectorCount}`);
    console.log(`   • Index size: ${finalStats.pineconeStats.totalSize}`);
    console.log(`   • Embedding model: ${finalStats.embeddingServiceInfo.model}`);
    console.log(`   • Vector dimensions: ${finalStats.embeddingServiceInfo.dimensions}`);
    
    // Test query with improved metadata
    console.log('\n🔍 Testing improved chapter metadata...');
    const queryResults = await orchestrator.query('What is a polynomial?', 3);
    
    console.log('Sample query results with improved chapters:');
    queryResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Score: ${result.score?.toFixed(4)} | ${result.metadata?.title || 'Unknown'}`);
      console.log(`      Subject: ${result.metadata?.subject || 'Unknown'}`);
      console.log(`      Chapter: ${result.metadata?.chapter || 'Unknown'}`);
      console.log(`      Text: ${result.metadata?.text?.substring(0, 100) || 'No text'}...`);
    });
    
    console.log('\n🎉 Your RAG system now has clean, improved chapter metadata!');
    console.log('No more "SENIOR CONTRIBUTING AUTHORS" as chapter names!');
    console.log('You can now query your textbooks using: npm run query "your question"');
    
  } catch (error) {
    console.error('❌ Clean reprocessing failed:', error);
    process.exit(1);
  }
}

/**
 * Get list of PDF files from the pdfs directory
 */
async function getLocalPDFs(): Promise<LocalPDFInfo[]> {
  const pdfsDir = './pdfs';
  const files = await fs.readdir(pdfsDir);
  const pdfFiles: LocalPDFInfo[] = [];
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.pdf')) {
      const filePath = join(pdfsDir, file);
      const stats = await fs.stat(filePath);
      
      const pdfInfo: LocalPDFInfo = {
        filename: file,
        title: extractTitleFromFilename(file),
        subject: extractSubjectFromFilename(file),
        filePath,
        fileSize: stats.size,
      };
      
      pdfFiles.push(pdfInfo);
    }
  }
  
  return pdfFiles;
}

/**
 * Process a single local PDF through the RAG pipeline
 */
async function processLocalPDF(pdfInfo: LocalPDFInfo): Promise<{
  chunks: any[];
  embeddings: any[];
  indexedCount: number;
}> {
  const { PDFProcessor } = await import('../services/pdf-processor.js');
  const { ContentChunker } = await import('../services/content-chunker.js');
  const { EmbeddingService } = await import('../services/embedding-service.js');
  const { PineconeService } = await import('../services/pinecone-service.js');
  
  const pdfProcessor = new PDFProcessor();
  const contentChunker = new ContentChunker();
  const embeddingService = new EmbeddingService();
  const pineconeService = new PineconeService();
  
  // Create textbook metadata
  const textbookMetadata = {
    book: generateBookId(pdfInfo.title),
    title: pdfInfo.title,
    subject: pdfInfo.subject,
    url: pdfInfo.filePath,
    downloadDate: new Date().toISOString(),
    fileSize: pdfInfo.fileSize,
  };
  
  // Step 1: Extract text from PDF
  const pdfContent = await pdfProcessor.processPDF(pdfInfo.filePath, textbookMetadata);
  
  // Step 2: Chunk the content (with improved structure detection)
  const chunkingResult = await contentChunker.chunkContent(pdfContent.text, {
    book: textbookMetadata.book,
    title: textbookMetadata.title,
    subject: textbookMetadata.subject,
  });
  
  // Update total chunks in metadata
  chunkingResult.chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunkingResult.chunks.length;
  });
  
  // Step 3: Generate embeddings
  const embeddings = await embeddingService.generateEmbeddings(chunkingResult.chunks);
  
  // Step 4: Index in Pinecone
  const upsertResult = await pineconeService.upsertVectors(chunkingResult.chunks, embeddings);
  
  return {
    chunks: chunkingResult.chunks,
    embeddings,
    indexedCount: upsertResult.successCount,
  };
}

/**
 * Extract a clean title from filename
 */
function extractTitleFromFilename(filename: string): string {
  return filename
    .replace('.pdf', '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract subject from filename based on user's categorization
 */
function extractSubjectFromFilename(filename: string): string {
  const title = filename.toLowerCase();
  
  if (title.includes('algebra') || title.includes('statistics')) {
    return 'Math';
  }
  
  if (title.includes('biology') || title.includes('anatomy') || title.includes('physiology')) {
    return 'Science';
  }
  
  if (title.includes('writing') || title.includes('guide') || title.includes('handbook')) {
    return 'English';
  }
  
  if (title.includes('philosophy') || title.includes('history')) {
    return 'Humanities';
  }
  
  return 'General';
}

/**
 * Generate a book ID from title
 */
function generateBookId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format bytes into human-readable string
 */
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Run the clean reprocessing
cleanReprocessPDFs().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 