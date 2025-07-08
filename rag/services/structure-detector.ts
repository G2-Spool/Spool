/**
 * Enhanced structure detector for textbooks
 * Improved detection of chapters, sections, and document structure
 */

import { logger } from '../utils/logger.js';
import { ChapterMetadata, SectionMetadata } from '../types/index.js';

interface StructureDetectionResult {
  chapters: ChapterMetadata[];
  sections: SectionMetadata[];
  structureQuality: number; // 0-1 score indicating confidence in structure detection
  fallbackUsed: boolean;
}

interface StructurePattern {
  type: 'chapter' | 'section' | 'subsection';
  pattern: RegExp;
  confidence: number;
  description: string;
}

export class StructureDetector {
  // Metadata patterns that should be excluded from chapter detection
  private metadataExclusionPatterns: RegExp[] = [
    /^(?:SENIOR\s+)?CONTRIBUTING\s+AUTHORS?$/i,
    /^AUTHORS?$/i,
    /^ACKNOWLEDGMENTS?$/i,
    /^PREFACE$/i,
    /^FOREWORD$/i,
    /^INTRODUCTION$/i,
    /^TABLE\s+OF\s+CONTENTS$/i,
    /^INDEX$/i,
    /^APPENDIX$/i,
    /^BIBLIOGRAPHY$/i,
    /^REFERENCES$/i,
    /^GLOSSARY$/i,
    /^ABOUT\s+THE\s+AUTHORS?$/i,
    /^ABOUT\s+THIS\s+BOOK$/i,
    /^COPYRIGHT$/i,
    /^CREDITS$/i,
    /^PUBLISHER$/i,
    /^REVISION\s+HISTORY$/i,
    /^LEARNING\s+OBJECTIVES$/i,
    /^ANSWER\s+KEY$/i,
    /^SOLUTIONS$/i,
    /^END\s+OF\s+CHAPTER$/i,
    /^REVIEW\s+QUESTIONS$/i,
    /^PRACTICE\s+EXERCISES$/i,
    /^SUMMARY$/i,
    /^KEY\s+TERMS$/i,
    /^STUDY\s+GUIDE$/i,
    /^FURTHER\s+READING$/i,
    /^CHAPTER\s+REVIEW$/i,
    /^EXERCISES$/i,
    /^PROBLEMS$/i,
    /^QUIZ$/i,
    /^TEST\s+YOURSELF$/i,
    /^SELF\s+CHECK$/i,
    /^CHECKPOINTS?$/i,
    /^RESOURCES$/i,
    /^ADDITIONAL\s+RESOURCES$/i,
    /^WEB\s+RESOURCES$/i,
    /^ONLINE\s+RESOURCES$/i,
    /^SUGGESTED\s+READINGS?$/i,
    /^RECOMMENDED\s+READINGS?$/i,
    /^NOTES$/i,
    /^CHAPTER\s+NOTES$/i,
    // Publisher and organizational names
    /^OPENSTAX$/i,
    /^RICE\s+UNIVERSITY$/i,
    /^PHILANTHROPIC\s+SUPPORT$/i,
    /^CREATIVE\s+COMMONS$/i,
    /^MEDIA$/i,
    /^RICE$/i,
    /^HOUSTON$/i,
    /^UNIVERSITY$/i,
    /^COLLEGE$/i,
    /^DEPARTMENT$/i,
    /^FACULTY$/i,
    /^STAFF$/i,
    /^OFFICE$/i,
    /^BOARD$/i,
    /^COMMITTEE$/i,
    /^FOUNDATION$/i,
    /^PROGRAM$/i,
    /^INITIATIVE$/i,
    /^PROJECT$/i,
    /^TEAM$/i,
    /^GROUP$/i,
    /^CENTER$/i,
    /^INSTITUTE$/i,
    /^LABORATORY$/i,
    /^LIBRARY$/i,
    /^PRESS$/i,
    /^PUBLICATION$/i,
    /^EDITION$/i,
    /^VERSION$/i,
    /^VOLUME$/i,
    /^PART$/i,
    /^SECTION$/i,
    /^UNIT$/i,
    /^MODULE$/i,
    /^LESSON$/i,
    /^HOW\s+TO$/i,
    /^WHAT\s+IS$/i,
    /^WHEN\s+TO$/i,
    /^WHERE\s+TO$/i,
    /^WHY\s+TO$/i,
    // Foundation names that should be excluded
    /^THE\s+WILLIAM\s+AND\s+FLORA\s+HEWLETT\s+FOUNDATION$/i,
    /^WILLIAM\s+AND\s+FLORA\s+HEWLETT\s+FOUNDATION$/i,
    /^HEWLETT\s+FOUNDATION$/i,
    /^THE\s+BILL\s+AND\s+STEPHANIE\s+SICK\s+FUND$/i,
    /^BILL\s+AND\s+STEPHANIE\s+SICK\s+FUND$/i,
    /^SICK\s+FUND$/i,
    /^GATES\s+FOUNDATION$/i,
    /^BILL\s+AND\s+MELINDA\s+GATES\s+FOUNDATION$/i,
    /^BILL\s+&\s+MELINDA\s+GATES\s+FOUNDATION$/i,
    /^CARNEGIE\s+FOUNDATION$/i,
    /^FORD\s+FOUNDATION$/i,
    /^ROCKEFELLER\s+FOUNDATION$/i,
    /^NATIONAL\s+SCIENCE\s+FOUNDATION$/i,
    /^EDUCATIONAL\s+FOUNDATION$/i,
    /^LAURA\s+AND\s+JOHN\s+ARNOLD\s+FOUNDATION$/i,
    /^ARNOLD\s+FOUNDATION$/i,
    /^ARTHUR\s+AND\s+CARLYSE\s+CIOCCA\s+CHARITABLE\s+FOUNDATION$/i,
    /^CIOCCA\s+CHARITABLE\s+FOUNDATION$/i,
    /^GIRARD\s+FOUNDATION$/i,
    /^MAXFIELD\s+FOUNDATION$/i,
    /^THE\s+MAXFIELD\s+FOUNDATION$/i,
    /^OPEN\s+SOCIETY\s+FOUNDATIONS$/i,
    /^THE\s+OPEN\s+SOCIETY\s+FOUNDATIONS$/i,
    /^MICHELSON\s+20\s+MM\s+FOUNDATION$/i,
    /^CHAN\s+ZUCKERBERG\s+INITIATIVE$/i,
    /^ARNOLD\s+VENTURES$/i,
    /^DIGITAL\s+PROMISE$/i,
    /^GOOGLE\s+INC$/i,
    /^CHEGG\s+INC$/i,
    /^PHILANTHROPIC\s+SUPPORT$/i,
    /^DONOR\s+SUPPORT$/i,
    /^GENEROUS\s+SUPPORT$/i,
    /^GRATEFUL\s+FOR$/i,
    /^THANKS\s+TO$/i,
    // Generic fragment patterns that shouldn't be chapters
    /^the\s+body$/i,
    /^the\s+cell$/i,
    /^the\s+process$/i,
    /^the\s+system$/i,
    /^the\s+structure$/i,
    /^the\s+function$/i,
    /^the\s+surface$/i,
    /^the\s+secretion$/i,
    /^Which\s+structure\s+is\s+associated\s+with\s+the$/i,
    /^Which\s+part\s+of\s+the\s+urinary\s+system\s+is/i,
    /^Which\s+of\s+the\s+following$/i,
    /^What\s+is\s+the$/i,
    /^How\s+does\s+the$/i,
    /^Where\s+is\s+the$/i,
    /^When\s+does\s+the$/i,
    /^Why\s+does\s+the$/i
  ];

  private chapterPatterns: StructurePattern[] = [
    {
      type: 'chapter',
      pattern: /^(?:Chapter|CHAPTER|Ch\.?)\s*(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.9,
      description: 'Standard chapter format with number and optional title'
    },
    {
      type: 'chapter',
      pattern: /^(\d+)\s*[:.\-]\s*(.+)$/,
      confidence: 0.8,
      description: 'Numbered chapter without "Chapter" prefix'
    },
    {
      type: 'chapter',
      pattern: /^Unit\s+(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.8,
      description: 'Unit-based chapter structure'
    },
    {
      type: 'chapter',
      pattern: /^Part\s+([IVX]+|\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.8,
      description: 'Part-based chapter structure'
    },
    // New patterns for descriptive chapter titles commonly found in textbooks
    {
      type: 'chapter',
      pattern: /^(The\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Level\s+of\s+Organization)?)\s*$/i,
      confidence: 0.95,
      description: 'Descriptive chapter titles starting with "The" (e.g., "The Chemical Level of Organization")'
    },
    {
      type: 'chapter',
      pattern: /^([A-Z][a-z]+(?:\s+[a-z]+)*\s+Level\s+of\s+Organization)\s*$/i,
      confidence: 0.9,
      description: 'Chapter titles ending with "Level of Organization"'
    },
    {
      type: 'chapter',
      pattern: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s*$/,
      confidence: 0.7,
      description: 'General descriptive chapter titles (2-5 title case words)'
    },
    {
      type: 'chapter',
      pattern: /^([A-Z][A-Z\s]+)$/,
      confidence: 0.3, // Very low confidence for all-caps
      description: 'All uppercase chapter title (last resort)'
    }
  ];

  private sectionPatterns: StructurePattern[] = [
    {
      type: 'section',
      pattern: /^(\d+)\.(\d+)\s*[:.\-]?\s*(.+)$/,
      confidence: 0.9,
      description: 'Standard section numbering (1.1, 1.2, etc.)'
    },
    {
      type: 'section',
      pattern: /^Section\s+(\d+)\.(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.9,
      description: 'Explicit section with numbering'
    },
    {
      type: 'subsection',
      pattern: /^(\d+)\.(\d+)\.(\d+)\s*[:.\-]?\s*(.+)$/,
      confidence: 0.8,
      description: 'Subsection numbering (1.1.1, 1.1.2, etc.)'
    },
    {
      type: 'section',
      pattern: /^(\d+)\.\s*(.+)$/,
      confidence: 0.6,
      description: 'Simple numbered section'
    },
    // New patterns for descriptive section headings
    {
      type: 'section',
      pattern: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+and\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?)$/,
      confidence: 0.7,
      description: 'Title case section heading (e.g., "Chemical Bonds", "Atoms and Molecules")'
    },
    {
      type: 'section',
      pattern: /^([A-Z][a-z]+(?:\s+[a-z]+)*(?:\s+[A-Z][a-z]+(?:\s+[a-z]+)*)?)$/,
      confidence: 0.6,
      description: 'Mixed case section heading'
    },
    {
      type: 'section',
      pattern: /^([A-Z][a-z]+(?:\s+[a-z]+)*(?:\s+of\s+[A-Z][a-z]+(?:\s+[a-z]+)*)?)$/,
      confidence: 0.7,
      description: 'Section heading with "of" (e.g., "Structure of Atoms")'
    }
  ];

  /**
   * Detect document structure from text
   * @param text - Full text of the document
   * @returns Structure detection result with chapters and sections
   */
  async detectStructure(text: string): Promise<StructureDetectionResult> {
    logger.info('Starting structure detection');
    
    const lines = text.split('\n');
    const chapters: ChapterMetadata[] = [];
    const sections: SectionMetadata[] = [];
    
    let currentChapter: ChapterMetadata | null = null;
    let structureScore = 0;
    let totalConfidence = 0;
    let detectedElements = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Skip lines that are too long (likely paragraph text)
      if (line.length > 150) continue;
      
      // Check for chapter patterns
      const chapterMatch = this.matchChapterPattern(line);
      if (chapterMatch) {
        currentChapter = {
          title: chapterMatch.title,
          number: chapterMatch.number,
          startPage: this.estimatePageNumber(i, lines.length),
          confidence: chapterMatch.confidence,
        };
        
        // End previous chapter
        if (chapters.length > 0 && currentChapter.startPage) {
          chapters[chapters.length - 1].endPage = currentChapter.startPage - 1;
        }
        
        chapters.push(currentChapter);
        structureScore += chapterMatch.confidence;
        detectedElements++;
        totalConfidence += chapterMatch.confidence;
        
        logger.debug(`Detected chapter: ${currentChapter.title} (${currentChapter.number})`);
        continue;
      }
      
      // Check for section patterns
      const sectionMatch = this.matchSectionPattern(line);
      if (sectionMatch) {
        const section: SectionMetadata = {
          title: sectionMatch.title,
          number: sectionMatch.number,
          chapter: currentChapter?.title || 'Unknown',
          level: sectionMatch.level,
        };
        
        sections.push(section);
        structureScore += sectionMatch.confidence;
        detectedElements++;
        totalConfidence += sectionMatch.confidence;
        
        logger.debug(`Detected section: ${section.title} (${section.number})`);
      }
    }
    
    // Calculate structure quality
    const structureQuality = detectedElements > 0 ? totalConfidence / detectedElements : 0;
    const fallbackUsed = structureQuality < 0.3;
    
    // Limit the number of chapters to a reasonable amount
    // Most textbooks have 5-30 chapters, not thousands
    const maxChapters = 50;
    if (chapters.length > maxChapters) {
      logger.info(`Limiting chapters from ${chapters.length} to ${maxChapters} highest confidence chapters`);
      
      // Sort chapters by confidence and keep only the top ones
      const chaptersWithConfidence = chapters.map((chapter, index) => ({
        chapter,
        confidence: chapter.confidence || 0.1, // Default low confidence if not set
        originalIndex: index
      }));
      
      chaptersWithConfidence.sort((a, b) => b.confidence - a.confidence);
      
      // Keep only the top chapters
      const topChapters = chaptersWithConfidence.slice(0, maxChapters);
      
      // Sort back by original order (page order)
      topChapters.sort((a, b) => a.originalIndex - b.originalIndex);
      
      // Update chapters array
      chapters.length = 0;
      chapters.push(...topChapters.map(item => item.chapter));
    }
    
    // Apply heuristic improvements
    this.improveStructureHeuristics(chapters, sections, text);
    
    const result: StructureDetectionResult = {
      chapters,
      sections,
      structureQuality,
      fallbackUsed,
    };
    
    logger.info(`Structure detection complete: ${chapters.length} chapters, ${sections.length} sections (quality: ${structureQuality.toFixed(2)})`);
    
    return result;
  }

  /**
   * Check if a line should be excluded as metadata
   * @param line - Line to check
   * @returns True if line should be excluded
   */
  private isMetadataLine(line: string): boolean {
    return this.metadataExclusionPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Match a line against chapter patterns
   * @param line - Line to test
   * @returns Match result with confidence score
   */
  private matchChapterPattern(line: string): { title: string; number: string; confidence: number } | null {
    // Skip metadata lines
    if (this.isMetadataLine(line)) {
      return null;
    }
    
    for (const pattern of this.chapterPatterns) {
      const match = line.match(pattern.pattern);
      if (match) {
        let title = '';
        let number = '';
        
                  switch (pattern.type) {
            case 'chapter':
              // Handle "Chapter 2: The Chemical Level of Organization" format
              if (match[1] && match[2]) {
                number = match[1];
                title = match[2].trim(); // Use the descriptive title
              }
              // Handle "2: The Chemical Level of Organization" format
              else if (match[2]) {
                title = match[2].trim();
                number = this.extractNumberFromTitle(match[2]) || match[1];
              }
              // Handle descriptive titles like "The Chemical Level of Organization" 
              else if (match[1]) {
                if (/^\d+$/.test(match[1])) {
                  number = match[1];
                  title = `Chapter ${match[1]}`;
                } else {
                  title = match[1].trim();
                  number = this.extractNumberFromTitle(match[1]) || '0';
                }
              }
              break;
          }
        
        // Additional validation for all-caps titles
        if (title && pattern.pattern.source === '^([A-Z][A-Z\\s]+)$') {
          // For all-caps titles, be very strict about what we accept
          // Skip if too short, too long, or doesn't look like a chapter title
          if (title.length < 8 || title.length > 100) {
            continue;
          }
          
          // Must contain at least one meaningful word (not just initials/acronyms)
          const words = title.split(/\s+/);
          const hasSubstantialWords = words.some(word => word.length >= 4);
          if (!hasSubstantialWords) {
            continue;
          }
          
          // Skip if it contains any metadata indicators
          if (/(?:AUTHOR|CREDIT|PUBLISHER|COPYRIGHT|REVISION|EXERCISE|REVIEW|SUMMARY|INDEX|APPENDIX|BIBLIOGRAPHY|REFERENCE|GLOSSARY|SOLUTION|ANSWER|KEY|TERM|QUIZ|TEST|CHECK|RESOURCE|NOTE|MEDIA|SUPPORT|UNIVERSITY|COLLEGE|RICE|OPENSTAX|HOUSTON|FACULTY|STAFF|OFFICE|BOARD|COMMITTEE|FOUNDATION|PROGRAM|INITIATIVE|PROJECT|TEAM|GROUP|CENTER|INSTITUTE|LABORATORY|LIBRARY|PRESS|PUBLICATION|EDITION|VERSION|VOLUME|PART|SECTION|UNIT|MODULE|LESSON|HOW|WHAT|WHEN|WHERE|WHY|PHILANTHROPIC|CREATIVE|COMMONS)/i.test(title)) {
            continue;
          }
          
          // Must contain typical chapter-like words
          const chapterWords = /(?:LEVEL|ORGANIZATION|STRUCTURE|FUNCTION|PROCESS|SYSTEM|CELL|TISSUE|ORGAN|BODY|HUMAN|CHEMICAL|BIOLOGICAL|PHYSICAL|INTRODUCTION|OVERVIEW|FOUNDATION|PRINCIPLES|BASICS|FUNDAMENTALS|CONCEPTS|THEORY|PRACTICE|APPLICATION|ANALYSIS|SYNTHESIS|EVALUATION|ALGEBRA|EQUATION|FUNCTION|GRAPH|POLYNOMIAL|EXPONENTIAL|LOGARITHM|TRIGONOMETRY|GEOMETRY|CALCULUS|STATISTICS|PROBABILITY|MATRIX|VECTOR|DERIVATIVE|INTEGRAL|LIMIT|SERIES|SEQUENCE|BIOLOGY|CHEMISTRY|PHYSICS|ANATOMY|PHYSIOLOGY|EVOLUTION|GENETICS|ECOLOGY|PHILOSOPHY|ETHICS|LOGIC|METAPHYSICS|EPISTEMOLOGY|HISTORY|CULTURE|CIVILIZATION|SOCIETY|POLITICS|ECONOMICS|RELIGION|ART|LITERATURE|WRITING|GRAMMAR|SYNTAX|RHETORIC|COMPOSITION|ESSAY|NARRATIVE|POETRY|DRAMA)/i;
          if (!chapterWords.test(title)) {
            continue;
          }
        }
        
        // Additional validation for all chapter titles
        if (title && title.length > 0) {
          // Skip fragments and incomplete sentences
          if (title.length < 8 || title.length > 100) {
            continue;
          }
          
          // Skip titles that are clearly fragments or questions
          if (/^(?:the|a|an|which|what|how|where|when|why|that|this|these|those)\s+/i.test(title) && title.length < 30) {
            continue;
          }
          
          // Skip titles that end with incomplete phrases
          if (/\s+(?:is|are|was|were|the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(title)) {
            continue;
          }
          
          // Skip titles that look like sentence fragments
          if (/^[a-z]/.test(title) && title.split(/\s+/).length > 5) {
            continue;
          }
        }
        
        if (title || number) {
          return {
            title: title || `Chapter ${number}`,
            number: number || this.extractNumberFromTitle(title),
            confidence: pattern.confidence,
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Match a line against section patterns
   * @param line - Line to test
   * @returns Match result with confidence score
   */
  private matchSectionPattern(line: string): { title: string; number: string; level: number; confidence: number } | null {
    // Skip if line is too short or too long
    if (line.length < 3 || line.length > 100) {
      return null;
    }
    
    // Skip if line contains common text indicators (paragraph content)
    if (/\b(?:the|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall|this|that|these|those|a|an)\b/i.test(line) && line.split(/\s+/).length > 8) {
      return null;
    }
    
    for (const pattern of this.sectionPatterns) {
      const match = line.match(pattern.pattern);
      if (match) {
        let title = '';
        let number = '';
        let level = 1;
        
        switch (pattern.type) {
          case 'section':
            // Handle "1.1 Section Title" format
            if (match[1] && match[2] && match[3]) {
              number = `${match[1]}.${match[2]}`;
              title = match[3].trim();
            }
            // Handle "1. Section Title" format
            else if (match[1] && match[2]) {
              number = match[1];
              title = match[2].trim();
            }
            // Handle descriptive titles like "Chemical Bonds"
            else if (match[1]) {
              title = match[1].trim();
              number = this.extractNumberFromTitle(match[1]) || '0';
            }
            break;
          case 'subsection':
            if (match[1] && match[2] && match[3] && match[4]) {
              number = `${match[1]}.${match[2]}.${match[3]}`;
              title = match[4].trim();
              level = 2;
            }
            break;
        }
        
        // Validate descriptive section titles
        if (title && !number.match(/^\d+/)) {
          // Must be title case or mixed case
          if (!/^[A-Z][a-z]/.test(title)) {
            continue;
          }
          
          // Must contain relevant words for sections
          const sectionWords = /(?:atoms?|molecules?|bonds?|elements?|compounds?|reactions?|energy|matter|structure|function|process|system|introduction|overview|definition|properties|characteristics|types|classification|formation|interaction|relationship|comparison|analysis|synthesis|evaluation|application|example|case|study|method|technique|procedure|principle|concept|theory|law|rule|equation|formula|model|diagram|figure|table|chart|graph|data|result|conclusion|summary|review|exercise|problem|solution|answer|key|term|glossary|reference|bibliography|index|appendix)/i;
          if (!sectionWords.test(title)) {
            continue;
          }
          
          // Skip if it looks like a sentence or paragraph
          if (title.includes('.') && title.split('.').length > 2) {
            continue;
          }
        }
        
        if (title || number) {
          return {
            title: title || `Section ${number}`,
            number: number || '0',
            level,
            confidence: pattern.confidence,
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Extract number from a title string
   * @param title - Title to extract number from
   * @returns Extracted number or empty string
   */
  private extractNumberFromTitle(title: string): string {
    const match = title.match(/\b(\d+)\b/);
    return match ? match[1] : '';
  }

  /**
   * Estimate page number based on line position
   * @param lineIndex - Current line index
   * @param totalLines - Total lines in document
   * @returns Estimated page number
   */
  private estimatePageNumber(lineIndex: number, totalLines: number): number {
    // Rough estimation: assume ~50 lines per page
    const linesPerPage = 50;
    return Math.floor(lineIndex / linesPerPage) + 1;
  }

  /**
   * Apply heuristic improvements to detected structure
   * @param chapters - Detected chapters
   * @param sections - Detected sections
   * @param text - Full text for additional analysis
   */
  private improveStructureHeuristics(chapters: ChapterMetadata[], sections: SectionMetadata[], text: string): void {
    // Sort chapters by number
    chapters.sort((a, b) => {
      const aNum = parseInt(a.number.toString(), 10) || 0;
      const bNum = parseInt(b.number.toString(), 10) || 0;
      return aNum - bNum;
    });
    
    // Sort sections by chapter and number
    sections.sort((a, b) => {
      const aChapter = a.chapter;
      const bChapter = b.chapter;
      if (aChapter !== bChapter) {
        return aChapter.localeCompare(bChapter);
      }
      
      const aNum = parseFloat(a.number) || 0;
      const bNum = parseFloat(b.number) || 0;
      return aNum - bNum;
    });
    
    // Fill in missing end pages for chapters
    for (let i = 0; i < chapters.length - 1; i++) {
      if (!chapters[i].endPage) {
        chapters[i].endPage = chapters[i + 1].startPage! - 1;
      }
    }
    
    // Estimate end page for last chapter
    if (chapters.length > 0 && !chapters[chapters.length - 1].endPage) {
      const estimatedTotalPages = Math.ceil(text.split('\n').length / 50);
      chapters[chapters.length - 1].endPage = estimatedTotalPages;
    }
  }
} 