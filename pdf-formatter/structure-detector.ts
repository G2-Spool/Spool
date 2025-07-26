import { ChapterMetadata, SectionMetadata } from './types.js';

interface StructureDetectionResult {
  chapters: ChapterMetadata[];
  sections: SectionMetadata[];
  structureQuality: number;
}

interface StructurePattern {
  type: 'chapter' | 'section' | 'subsection';
  pattern: RegExp;
  confidence: number;
}

export class StructureDetector {
  private chapterPatterns: StructurePattern[] = [
    {
      type: 'chapter',
      pattern: /^(?:Chapter|CHAPTER|Ch\.?)\s*(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.9,
    },
    {
      type: 'chapter',
      pattern: /^(\d+)\s*[:.\-]\s*(.+)$/,
      confidence: 0.8,
    },
    {
      type: 'chapter',
      pattern: /^Unit\s+(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.8,
    },
    {
      type: 'chapter',
      pattern: /^(The\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Level\s+of\s+Organization)?)\s*$/i,
      confidence: 0.95,
    },
    {
      type: 'chapter',
      pattern: /^([A-Z][a-z]+(?:\s+[a-z]+)*\s+Level\s+of\s+Organization)\s*$/i,
      confidence: 0.9,
    },
    {
      type: 'chapter',
      pattern: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s*$/,
      confidence: 0.7,
    },
  ];

  private sectionPatterns: StructurePattern[] = [
    {
      type: 'section',
      pattern: /^(\d+)\.(\d+)\s*[:.\-]?\s*(.+)$/,
      confidence: 0.9,
    },
    {
      type: 'section',
      pattern: /^Section\s+(\d+)\.(\d+)(?:\s*[:.\-]\s*(.+))?$/i,
      confidence: 0.9,
    },
    {
      type: 'subsection',
      pattern: /^(\d+)\.(\d+)\.(\d+)\s*[:.\-]?\s*(.+)$/,
      confidence: 0.8,
    },
    {
      type: 'section',
      pattern: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+and\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?)$/,
      confidence: 0.7,
    },
  ];

  detectStructure(text: string): StructureDetectionResult {
    const lines = text.split('\n');
    const chapters: ChapterMetadata[] = [];
    const sections: SectionMetadata[] = [];
    
    let currentChapter: ChapterMetadata | null = null;
    let totalConfidence = 0;
    let detectedElements = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.length > 150) continue;
      
      // Check for chapter patterns
      const chapterMatch = this.matchChapterPattern(line);
      if (chapterMatch) {
        currentChapter = {
          title: chapterMatch.title,
          number: chapterMatch.number,
          startPage: Math.floor(i / 50) + 1,
          confidence: chapterMatch.confidence,
        };
        
        if (chapters.length > 0) {
          chapters[chapters.length - 1].endPage = currentChapter.startPage - 1;
        }
        
        chapters.push(currentChapter);
        totalConfidence += chapterMatch.confidence;
        detectedElements++;
        continue;
      }
      
      // Check for section patterns
      const sectionMatch = this.matchSectionPattern(line);
      if (sectionMatch && currentChapter) {
        const section: SectionMetadata = {
          title: sectionMatch.title,
          number: sectionMatch.number,
          chapter: currentChapter.title,
          level: sectionMatch.level,
          confidence: sectionMatch.confidence,
        };
        
        sections.push(section);
        totalConfidence += sectionMatch.confidence;
        detectedElements++;
      }
    }
    
    // Calculate structure quality
    const structureQuality = detectedElements > 0 ? totalConfidence / detectedElements : 0;
    
    // Limit chapters to reasonable amount
    if (chapters.length > 50) {
      chapters.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
      chapters.length = 50;
      chapters.sort((a, b) => {
        const aNum = parseInt(a.number.toString()) || 0;
        const bNum = parseInt(b.number.toString()) || 0;
        return aNum - bNum;
      });
    }
    
    return {
      chapters,
      sections,
      structureQuality,
    };
  }

  private matchChapterPattern(line: string): { title: string; number: string; confidence: number } | null {
    // Skip common metadata patterns
    if (/^(?:AUTHOR|PREFACE|INDEX|APPENDIX|BIBLIOGRAPHY|GLOSSARY|COPYRIGHT)/i.test(line)) {
      return null;
    }
    
    for (const pattern of this.chapterPatterns) {
      const match = line.match(pattern.pattern);
      if (match) {
        let title = '';
        let number = '';
        
        if (match[1] && match[2]) {
          number = match[1];
          title = match[2].trim();
        } else if (match[1]) {
          if (/^\d+$/.test(match[1])) {
            number = match[1];
            title = `Chapter ${match[1]}`;
          } else {
            title = match[1].trim();
            number = this.extractNumberFromTitle(match[1]) || '0';
          }
        }
        
        if (title || number) {
          return {
            title: title || `Chapter ${number}`,
            number: number || '0',
            confidence: pattern.confidence,
          };
        }
      }
    }
    
    return null;
  }

  private matchSectionPattern(line: string): { title: string; number: string; level: number; confidence: number } | null {
    if (line.length < 3 || line.length > 100) return null;
    
    for (const pattern of this.sectionPatterns) {
      const match = line.match(pattern.pattern);
      if (match) {
        let title = '';
        let number = '';
        let level = 1;
        
        if (pattern.type === 'section') {
          if (match[1] && match[2] && match[3]) {
            number = `${match[1]}.${match[2]}`;
            title = match[3].trim();
          } else if (match[1] && match[2]) {
            number = match[1];
            title = match[2].trim();
          } else if (match[1]) {
            title = match[1].trim();
            number = '0';
          }
        } else if (pattern.type === 'subsection') {
          if (match[1] && match[2] && match[3] && match[4]) {
            number = `${match[1]}.${match[2]}.${match[3]}`;
            title = match[4].trim();
            level = 2;
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

  private extractNumberFromTitle(title: string): string {
    const match = title.match(/\b(\d+)\b/);
    return match ? match[1] : '';
  }
}