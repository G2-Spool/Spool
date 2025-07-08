/**
 * Type definitions for RAG infrastructure
 * Defines interfaces and types used throughout the application
 */

export interface TextbookMetadata {
  book: string;
  title: string;
  author?: string;
  subject: string;
  url: string;
  downloadDate: string;
  fileSize?: number;
  pageCount?: number;
}

export interface ChapterMetadata {
  title: string;
  number: string | number;
  startPage?: number;
  endPage?: number;
  confidence?: number;
}

export interface SectionMetadata {
  title: string;
  number: string;
  chapter: string;
  level: number; // 1 for main sections, 2 for subsections, etc.
}

export interface ChunkMetadata {
  book: string;
  title: string;
  subject: string;
  chapter?: string;
  section?: string;
  chunkId: string;
  chunkIndex: number;
  totalChunks: number;
  contentType: 'text' | 'formula' | 'definition' | 'example' | 'exercise';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  keywords?: string[];
  pageNumbers?: number[];
}

export interface ProcessedChunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
  embedding?: number[];
  semanticSimilarity?: number;
}

export interface ChunkingStrategy {
  name: string;
  chunkSize: number;
  chunkOverlap: number;
  minChunkSize: number;
  preserveStructure: boolean;
  semanticAware: boolean;
}

export interface ChunkingResult {
  chunks: ProcessedChunk[];
  strategy: ChunkingStrategy;
  stats: {
    totalChunks: number;
    averageChunkSize: number;
    structurePreserved: boolean;
    fallbackUsed: boolean;
    processingTime: number;
  };
}

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  model: string;
  dimensions: number;
  processingTime: number;
}

export interface PineconeMetadata {
  [key: string]: string | number | boolean | string[];
}

export interface PineconeVector {
  id: string;
  values: number[];
  metadata: PineconeMetadata;
}

export interface ProcessingProgress {
  stage: 'downloading' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'complete';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface OpenStaxTextbook {
  id: string;
  title: string;
  subject: string;
  downloadUrl: string;
  webUrl: string;
  description?: string;
  authors?: string[];
  isbn?: string;
  publicationDate?: string;
} 