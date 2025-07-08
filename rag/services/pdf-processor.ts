/**
 * Improved PDF processor with better text extraction and spacing handling
 * Addresses common issues with PDF-to-text conversion including missing spaces
 */

import pdfParse from 'pdf-parse';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger.js';
import { TextbookMetadata } from '../types/index.js';

interface PDFProcessingOptions {
  preserveSpacing: boolean;
  normalizeWhitespace: boolean;
  removePageNumbers: boolean;
  removeUrls: boolean;
  detectMathematicalContent: boolean;
}

interface ProcessedPDFContent {
  text: string;
  metadata: {
    pages: number;
    fileSize: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  processingStats: {
    originalLength: number;
    processedLength: number;
    spacingCorrected: boolean;
    mathContentDetected: boolean;
  };
}

export class PDFProcessor {
  private options: PDFProcessingOptions;

  constructor(options: Partial<PDFProcessingOptions> = {}) {
    this.options = {
      preserveSpacing: true,
      normalizeWhitespace: true,
      removePageNumbers: true,
      removeUrls: true,
      detectMathematicalContent: true,
      ...options,
    };
  }

  /**
   * Process a PDF file and extract clean text with improved spacing
   * @param filePath - Path to the PDF file
   * @param textbookMetadata - Optional metadata about the textbook
   * @returns Processed PDF content with cleaned text
   */
  async processPDF(filePath: string, textbookMetadata?: Partial<TextbookMetadata>): Promise<ProcessedPDFContent> {
    try {
      logger.info(`Processing PDF: ${filePath}`);
      
      const pdfBuffer = await fs.readFile(filePath);
      const data = await pdfParse(pdfBuffer);
      
      const originalText = data.text;
      const originalLength = originalText.length;
      
      // Apply text cleaning and spacing corrections
      let processedText = originalText;
      
      if (this.options.preserveSpacing) {
        processedText = this.correctSpacing(processedText);
      }
      
      if (this.options.normalizeWhitespace) {
        processedText = this.normalizeWhitespace(processedText);
      }
      
      if (this.options.removePageNumbers) {
        processedText = this.removePageNumbers(processedText);
      }
      
      if (this.options.removeUrls) {
        processedText = this.removeUrls(processedText);
      }
      
      const mathContentDetected = this.options.detectMathematicalContent && 
        this.detectMathematicalContent(processedText);
      
      const result: ProcessedPDFContent = {
        text: processedText,
        metadata: {
          pages: data.numpages,
          fileSize: pdfBuffer.length,
          title: data.info?.Title || textbookMetadata?.title,
          author: data.info?.Author || textbookMetadata?.author,
          subject: data.info?.Subject || textbookMetadata?.subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
          modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
        },
        processingStats: {
          originalLength,
          processedLength: processedText.length,
          spacingCorrected: this.options.preserveSpacing,
          mathContentDetected,
        },
      };
      
      logger.info(`PDF processed successfully: ${result.metadata.pages} pages, ${result.processingStats.processedLength} characters`);
      
      return result;
      
    } catch (error) {
      logger.error(`Error processing PDF ${filePath}:`, error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Correct common spacing issues in PDF text extraction
   * @param text - Raw text from PDF
   * @returns Text with corrected spacing
   */
  private correctSpacing(text: string): string {
    // Common patterns where spaces are missing
    let corrected = text;
    
    // Add space between lowercase/uppercase transitions (likely word boundaries)
    corrected = corrected.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Add space between letters and numbers
    corrected = corrected.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    corrected = corrected.replace(/(\d)([a-zA-Z])/g, '$1 $2');
    
    // Add space between punctuation and letters (but preserve common contractions)
    corrected = corrected.replace(/([.!?])([A-Z])/g, '$1 $2');
    
    // Fix missing spaces after periods in sentences
    corrected = corrected.replace(/\.([a-z])/g, '. $1');
    
    // Add space between words that are concatenated (common pattern: wordWord)
    corrected = corrected.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');
    
    // Fix spacing around mathematical operators
    corrected = corrected.replace(/([a-zA-Z])([+\-*/=])/g, '$1 $2');
    corrected = corrected.replace(/([+\-*/=])([a-zA-Z])/g, '$1 $2');
    
    return corrected;
  }

  /**
   * Normalize whitespace while preserving paragraph structure
   * @param text - Text to normalize
   * @returns Text with normalized whitespace
   */
  private normalizeWhitespace(text: string): string {
    // Replace multiple spaces with single space
    let normalized = text.replace(/[ \t]+/g, ' ');
    
    // Preserve paragraph breaks (double newlines)
    normalized = normalized.replace(/\n\s*\n/g, '\n\n');
    
    // Remove excessive line breaks (more than 2)
    normalized = normalized.replace(/\n{3,}/g, '\n\n');
    
    // Trim each line
    normalized = normalized.split('\n').map(line => line.trim()).join('\n');
    
    return normalized.trim();
  }

  /**
   * Remove page numbers and headers/footers
   * @param text - Text to clean
   * @returns Text with page numbers removed
   */
  private removePageNumbers(text: string): string {
    // Remove standalone page numbers
    let cleaned = text.replace(/^\s*\d+\s*$/gm, '');
    
    // Remove page number patterns like "Page 1 of 100"
    cleaned = cleaned.replace(/^\s*Page\s+\d+\s*(of\s+\d+)?\s*$/gmi, '');
    
    // Remove chapter/section numbers at line start
    cleaned = cleaned.replace(/^\s*\d+\.\d+\s*$/gm, '');
    
    return cleaned;
  }

  /**
   * Remove URLs from text
   * @param text - Text to clean
   * @returns Text with URLs removed
   */
  private removeUrls(text: string): string {
    // Remove http/https URLs
    let cleaned = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remove www URLs
    cleaned = cleaned.replace(/www\.[^\s]+/g, '');
    
    // Remove email addresses
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    
    return cleaned;
  }

  /**
   * Detect mathematical content in text
   * @param text - Text to analyze
   * @returns True if mathematical content is detected
   */
  private detectMathematicalContent(text: string): boolean {
    // Look for mathematical symbols and patterns
    const mathPatterns = [
      /\$[^$]+\$/g,  // LaTeX inline math
      /\$\$[^$]+\$\$/g,  // LaTeX display math
      /∫|∑|∏|√|≤|≥|≠|±|∓|∞|π|α|β|γ|δ|ε|θ|λ|μ|ρ|σ|τ|φ|χ|ψ|ω/g,  // Mathematical symbols
      /\b\d+\s*[+\-*/=]\s*\d+\b/g,  // Simple equations
      /\b(?:sin|cos|tan|log|ln|exp|lim|int|sum|prod)\b/gi,  // Mathematical functions
      /\b\d+\s*[xy]\s*[+\-]\s*\d+\b/g,  // Algebraic expressions
    ];
    
    return mathPatterns.some(pattern => pattern.test(text));
  }
} 