import pdfParse from 'pdf-parse';
import { promises as fs } from 'fs';
import { TextbookMetadata } from './types.js';

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
  };
  hasMathContent: boolean;
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

  async processPDF(filePath: string): Promise<ProcessedPDFContent> {
    const pdfBuffer = await fs.readFile(filePath);
    const data = await pdfParse(pdfBuffer);
    
    let processedText = data.text;
    
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
    
    const hasMathContent = this.options.detectMathematicalContent && 
      this.detectMathematicalContent(processedText);
    
    return {
      text: processedText,
      metadata: {
        pages: data.numpages,
        fileSize: pdfBuffer.length,
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
      hasMathContent,
    };
  }

  private correctSpacing(text: string): string {
    let corrected = text;
    
    // Add space between lowercase/uppercase transitions
    corrected = corrected.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Add space between letters and numbers
    corrected = corrected.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    corrected = corrected.replace(/(\d)([a-zA-Z])/g, '$1 $2');
    
    // Add space after punctuation
    corrected = corrected.replace(/([.!?])([A-Z])/g, '$1 $2');
    corrected = corrected.replace(/\.([a-z])/g, '. $1');
    
    // Fix concatenated words
    corrected = corrected.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');
    
    return corrected;
  }

  private normalizeWhitespace(text: string): string {
    // Replace multiple spaces with single space
    let normalized = text.replace(/[ \t]+/g, ' ');
    
    // Preserve paragraph breaks
    normalized = normalized.replace(/\n\s*\n/g, '\n\n');
    normalized = normalized.replace(/\n{3,}/g, '\n\n');
    
    // Trim lines
    normalized = normalized.split('\n').map(line => line.trim()).join('\n');
    
    return normalized.trim();
  }

  private removePageNumbers(text: string): string {
    // Remove standalone page numbers
    let cleaned = text.replace(/^\s*\d+\s*$/gm, '');
    
    // Remove "Page X of Y" patterns
    cleaned = cleaned.replace(/^\s*Page\s+\d+\s*(of\s+\d+)?\s*$/gmi, '');
    
    return cleaned;
  }

  private removeUrls(text: string): string {
    // Remove URLs
    let cleaned = text.replace(/https?:\/\/[^\s]+/g, '');
    cleaned = cleaned.replace(/www\.[^\s]+/g, '');
    
    // Remove emails
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    
    return cleaned;
  }

  private detectMathematicalContent(text: string): boolean {
    const mathPatterns = [
      /\$[^$]+\$/g,  // LaTeX inline math
      /∫|∑|∏|√|≤|≥|≠|±|∞|π|α|β|γ|δ|ε|θ|λ|μ|σ|τ|φ|ω/g,  // Math symbols
      /\b\d+\s*[+\-*/=]\s*\d+\b/g,  // Equations
      /\b(?:sin|cos|tan|log|ln|exp|lim|int|sum)\b/gi,  // Math functions
    ];
    
    return mathPatterns.some(pattern => pattern.test(text));
  }
}