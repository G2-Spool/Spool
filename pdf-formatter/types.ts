export interface TextbookMetadata {
  title: string;
  author?: string;
  subject?: string;
  pageCount?: number;
  extractedDate: string;
}

export interface ChapterMetadata {
  title: string;
  number: string | number;
  startPage?: number;
  endPage?: number;
  confidence: number;
}

export interface SectionMetadata {
  title: string;
  number: string;
  chapter: string;
  level: number; // 1 for main sections, 2 for subsections, etc.
  confidence?: number;
}

export interface ContentSegment {
  id: string;
  text: string;
  type: 'chapter' | 'section' | 'subsection' | 'content' | 'definition' | 'example' | 'exercise';
  chapter?: string;
  section?: string;
  pageNumbers?: number[];
  keywords?: string[];
}

export interface StructuredDocument {
  metadata: TextbookMetadata;
  chapters: ChapterMetadata[];
  sections: SectionMetadata[];
  segments: ContentSegment[];
}

export interface ProcessingOptions {
  detectStructure: boolean;
  preserveFormatting: boolean;
  extractKeywords: boolean;
  minChapterConfidence: number;
}