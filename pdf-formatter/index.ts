#!/usr/bin/env node

import { PDFProcessor } from './pdf-processor.js';
import { ContentSegmenter } from './content-segmenter.js';
import { StructuredDocument, ProcessingOptions } from './types.js';
import { promises as fs } from 'fs';
import path from 'path';

export class TextbookFormatter {
  private pdfProcessor: PDFProcessor;
  private contentSegmenter: ContentSegmenter;
  
  constructor(options: Partial<ProcessingOptions> = {}) {
    this.pdfProcessor = new PDFProcessor();
    this.contentSegmenter = new ContentSegmenter(options);
  }
  
  async formatPDF(pdfPath: string): Promise<StructuredDocument> {
    console.log(`Processing PDF: ${pdfPath}`);
    
    // Extract text from PDF
    const processed = await this.pdfProcessor.processPDF(pdfPath);
    console.log(`Extracted ${processed.metadata.pages} pages`);
    
    // Segment content into structured format
    const segmented = await this.contentSegmenter.segmentContent(
      processed.text,
      {
        title: processed.metadata.title || path.basename(pdfPath, '.pdf'),
        subject: processed.metadata.subject,
      }
    );
    
    console.log(`Found ${segmented.chapters.length} chapters and ${segmented.sections.length} sections`);
    console.log(`Created ${segmented.segments.length} content segments`);
    
    // Create structured document
    const document: StructuredDocument = {
      metadata: {
        title: processed.metadata.title || path.basename(pdfPath, '.pdf'),
        author: processed.metadata.author,
        subject: processed.metadata.subject,
        pageCount: processed.metadata.pages,
        extractedDate: new Date().toISOString(),
      },
      chapters: segmented.chapters,
      sections: segmented.sections,
      segments: segmented.segments,
    };
    
    return document;
  }
  
  async formatAndSave(pdfPath: string, outputPath?: string): Promise<void> {
    const document = await this.formatPDF(pdfPath);
    
    const output = outputPath || pdfPath.replace('.pdf', '_structured.json');
    await fs.writeFile(output, JSON.stringify(document, null, 2));
    
    console.log(`Saved structured document to: ${output}`);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node index.js <pdf-file> [output-file]');
    console.log('Example: node index.js textbook.pdf textbook_structured.json');
    process.exit(1);
  }
  
  const formatter = new TextbookFormatter({
    detectStructure: true,
    preserveFormatting: true,
    extractKeywords: true,
    minChapterConfidence: 0.7,
  });
  
  formatter.formatAndSave(args[0], args[1])
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { PDFProcessor } from './pdf-processor.js';
export { ContentSegmenter } from './content-segmenter.js';
export { StructureDetector } from './structure-detector.js';
export * from './types.js';