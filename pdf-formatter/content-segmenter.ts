import { StructureDetector } from './structure-detector.js';
import { ChapterMetadata, SectionMetadata, ContentSegment, ProcessingOptions } from './types.js';
import { createHash } from 'crypto';

export class ContentSegmenter {
  private structureDetector: StructureDetector;
  private options: ProcessingOptions;
  
  constructor(options: Partial<ProcessingOptions> = {}) {
    this.structureDetector = new StructureDetector();
    this.options = {
      detectStructure: true,
      preserveFormatting: true,
      extractKeywords: true,
      minChapterConfidence: 0.7,
      ...options,
    };
  }

  async segmentContent(
    text: string,
    metadata: { title: string; subject?: string }
  ): Promise<{
    chapters: ChapterMetadata[];
    sections: SectionMetadata[];
    segments: ContentSegment[];
  }> {
    // Detect structure
    const structureResult = this.structureDetector.detectStructure(text);
    
    // Segment content based on structure
    const segments = this.createSegments(
      text,
      structureResult.chapters,
      structureResult.sections
    );
    
    return {
      chapters: structureResult.chapters,
      sections: structureResult.sections,
      segments,
    };
  }

  private createSegments(
    text: string,
    chapters: ChapterMetadata[],
    sections: SectionMetadata[]
  ): ContentSegment[] {
    const segments: ContentSegment[] = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    let currentChapter: ChapterMetadata | null = null;
    let currentSection: SectionMetadata | null = null;
    let currentContent = '';
    let segmentIndex = 0;
    
    for (const paragraph of paragraphs) {
      const firstLine = paragraph.split('\n')[0].trim();
      
      // Check for chapter/section boundaries
      const chapterMatch = this.findMatchingChapter(firstLine, chapters);
      const sectionMatch = this.findMatchingSection(firstLine, sections);
      
      // Save current segment if we hit a boundary
      if ((chapterMatch || sectionMatch) && currentContent.trim()) {
        segments.push(this.createSegment(
          currentContent,
          currentChapter,
          currentSection,
          segmentIndex++
        ));
        currentContent = '';
      }
      
      // Update current context
      if (chapterMatch) {
        currentChapter = chapterMatch;
        currentSection = null;
        segments.push({
          id: this.generateId(`chapter_${chapterMatch.number}`),
          text: firstLine,
          type: 'chapter',
          chapter: chapterMatch.title,
        });
        continue;
      }
      
      if (sectionMatch) {
        currentSection = sectionMatch;
        segments.push({
          id: this.generateId(`section_${sectionMatch.number}`),
          text: firstLine,
          type: 'section',
          chapter: currentChapter?.title,
          section: sectionMatch.title,
        });
        continue;
      }
      
      // Accumulate content
      currentContent += (currentContent ? '\n\n' : '') + paragraph;
    }
    
    // Add final segment
    if (currentContent.trim()) {
      segments.push(this.createSegment(
        currentContent,
        currentChapter,
        currentSection,
        segmentIndex
      ));
    }
    
    return segments;
  }

  private createSegment(
    text: string,
    chapter: ChapterMetadata | null,
    section: SectionMetadata | null,
    index: number
  ): ContentSegment {
    const type = this.determineContentType(text);
    const keywords = this.options.extractKeywords ? this.extractKeywords(text) : undefined;
    
    return {
      id: this.generateId(`segment_${index}`),
      text: text.trim(),
      type,
      chapter: chapter?.title,
      section: section?.title,
      keywords,
    };
  }

  private findMatchingChapter(line: string, chapters: ChapterMetadata[]): ChapterMetadata | null {
    for (const chapter of chapters) {
      if (line.includes(chapter.title) || line.includes(chapter.number.toString())) {
        return chapter;
      }
    }
    return null;
  }

  private findMatchingSection(line: string, sections: SectionMetadata[]): SectionMetadata | null {
    for (const section of sections) {
      if (line.includes(section.title) || line.includes(section.number)) {
        return section;
      }
    }
    return null;
  }

  private determineContentType(text: string): ContentSegment['type'] {
    const lower = text.toLowerCase();
    
    if (lower.includes('definition') || lower.includes('define')) {
      return 'definition';
    }
    if (lower.includes('example') || lower.includes('for instance')) {
      return 'example';
    }
    if (lower.includes('exercise') || lower.includes('problem')) {
      return 'exercise';
    }
    
    return 'content';
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 
      'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    
    const keywords = words
      .filter(word => word.length > 4 && !stopWords.has(word))
      .filter(word => /^[a-z]+$/.test(word))
      .slice(0, 10);
    
    return [...new Set(keywords)];
  }

  private generateId(prefix: string): string {
    const hash = createHash('md5')
      .update(prefix + Date.now())
      .digest('hex')
      .substring(0, 8);
    return `${prefix}_${hash}`;
  }
}