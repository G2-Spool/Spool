#!/usr/bin/env tsx

/**
 * Process local PDF textbooks script
 * Processes PDF files from the ./pdfs directory into the RAG system
 */

import { RAGOrchestrator } from '../services/rag-orchestrator.js';
import { logger } from '../utils/logger.js';
import { TextbookMetadata } from '../types/index.js';
import { promises as fs } from 'fs';
import { join } from 'path';

interface LocalPDFInfo {
  filename: string;
  title: string;
  subject: string;
  filePath: string;
  fileSize: number;
}

async function processLocalPDFs() {
  console.log('📚 Processing Local PDF Textbooks');
  console.log('='.repeat(50));
  
  try {
    // Initialize orchestrator
    const orchestrator = new RAGOrchestrator({
      downloadDirectory: './pdfs', // Use pdfs directory instead of downloads
      enableProgressReporting: true,
    });
    
    // Initialize the system
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
    
    // Process each PDF
    console.log('\n🔄 Processing PDFs...');
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
    
    // Show results
    console.log('\n✅ Local PDF Processing Complete!');
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
    
    // Get system statistics
    const stats = await orchestrator.getSystemStats();
    console.log('\n📈 System Statistics:');
    console.log(`   • Index vectors: ${stats.pineconeStats.vectorCount}`);
    console.log(`   • Index size: ${stats.pineconeStats.totalSize}`);
    console.log(`   • Embedding model: ${stats.embeddingServiceInfo.model}`);
    console.log(`   • Vector dimensions: ${stats.embeddingServiceInfo.dimensions}`);
    
    // Test query
    console.log('\n🔍 Testing query functionality...');
    const queryResults = await orchestrator.query('What is algebra?', 3);
    
    console.log('Sample query results:');
    queryResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Score: ${result.score?.toFixed(4)} | ${result.metadata?.title || 'Unknown'}`);
      console.log(`      Subject: ${result.metadata?.subject || 'Unknown'}`);
      console.log(`      Text: ${result.metadata?.text?.substring(0, 100) || 'No text'}...`);
    });
    
    console.log('\n🎉 Your local PDF RAG system is ready for use!');
    console.log('You can now query your textbooks using: npm run query "your question"');
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
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
  const textbookMetadata: TextbookMetadata = {
    book: generateBookId(pdfInfo.title),
    title: pdfInfo.title,
    subject: pdfInfo.subject,
    url: pdfInfo.filePath,
    downloadDate: new Date().toISOString(),
    fileSize: pdfInfo.fileSize,
  };
  
  // Step 1: Extract text from PDF
  const pdfContent = await pdfProcessor.processPDF(pdfInfo.filePath, textbookMetadata);
  
  // Step 2: Chunk the content
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
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract subject from filename based on user's categorization
 * Math: College Algebra, Introductory Statistics
 * Science: Biology, Anatomy and Physiology
 * English: Writing Guide with Handbook
 * Humanities: Introduction to Philosophy, World History Volume 2 from 1400
 */
function extractSubjectFromFilename(filename: string): string {
  const title = filename.toLowerCase();
  
  // Math: College Algebra, Introductory Statistics
  if (title.includes('algebra') || title.includes('statistics')) {
    return 'Math';
  }
  
  // Science: Biology, Anatomy and Physiology
  if (title.includes('biology') || title.includes('anatomy') || title.includes('physiology')) {
    return 'Science';
  }
  
  // English: Writing Guide with Handbook
  if (title.includes('writing') || title.includes('guide') || title.includes('handbook')) {
    return 'English';
  }
  
  // Humanities: Introduction to Philosophy, World History Volume 2 from 1400
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

// Run the processing
processLocalPDFs().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 