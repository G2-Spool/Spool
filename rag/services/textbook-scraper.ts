/**
 * OpenStax textbook scraper service
 * Discovers and downloads textbooks from OpenStax.org
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { OpenStaxTextbook, TextbookMetadata } from '../types/index.js';

interface ScrapingOptions {
  downloadDirectory: string;
  maxConcurrentDownloads: number;
  retryAttempts: number;
  timeout: number;
}

interface ScrapingResult {
  downloadedBooks: TextbookMetadata[];
  errors: string[];
  totalSize: number;
  processingTime: number;
}

export class TextbookScraper {
  private options: ScrapingOptions;
  private baseUrl = 'https://openstax.org';

  constructor(options: Partial<ScrapingOptions> = {}) {
    this.options = {
      downloadDirectory: './downloads',
      maxConcurrentDownloads: 3,
      retryAttempts: 3,
      timeout: 30000,
      ...options,
    };
  }

  /**
   * Discover available textbooks from OpenStax
   * @returns Array of available textbooks
   */
  async discoverTextbooks(): Promise<OpenStaxTextbook[]> {
    logger.info('Discovering OpenStax textbooks');
    
    try {
      const response = await axios.get(`${this.baseUrl}/subjects`, {
        timeout: this.options.timeout,
      });
      
      const $ = cheerio.load(response.data);
      const textbooks: OpenStaxTextbook[] = [];
      
      // Extract textbook information from the subjects page
      $('.book-tile').each((index, element) => {
        const $element = $(element);
        const title = $element.find('.book-title').text().trim();
        const subject = $element.find('.subject').text().trim();
        const bookUrl = $element.find('a').attr('href');
        
        if (title && subject && bookUrl) {
          textbooks.push({
            id: this.generateBookId(title),
            title,
            subject,
            webUrl: bookUrl.startsWith('http') ? bookUrl : `${this.baseUrl}${bookUrl}`,
            downloadUrl: '', // Will be populated later
            description: $element.find('.book-description').text().trim(),
          });
        }
      });
      
      logger.info(`Discovered ${textbooks.length} textbooks`);
      return textbooks;
    } catch (error) {
      logger.error('Error discovering textbooks:', error);
      throw new Error(`Failed to discover textbooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific textbook
   * @param textbook - Basic textbook information
   * @returns Detailed textbook information with download URL
   */
  async getTextbookDetails(textbook: OpenStaxTextbook): Promise<OpenStaxTextbook> {
    logger.info(`Getting details for: ${textbook.title}`);
    
    try {
      const response = await axios.get(textbook.webUrl, {
        timeout: this.options.timeout,
      });
      
      const $ = cheerio.load(response.data);
      
      // Find PDF download link
      const pdfLink = $('a[href*=".pdf"]').first();
      let downloadUrl = pdfLink.attr('href') || '';
      
      if (downloadUrl && !downloadUrl.startsWith('http')) {
        downloadUrl = `${this.baseUrl}${downloadUrl}`;
      }
      
      // Extract additional metadata
      const authors = $('.author').map((i, el) => $(el).text().trim()).get();
      const isbn = $('.isbn').text().trim();
      const publicationDate = $('.publication-date').text().trim();
      
      return {
        ...textbook,
        downloadUrl,
        authors: authors.length > 0 ? authors : undefined,
        isbn: isbn || undefined,
        publicationDate: publicationDate || undefined,
      };
    } catch (error) {
      logger.error(`Error getting details for ${textbook.title}:`, error);
      throw new Error(`Failed to get textbook details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download a textbook PDF
   * @param textbook - Textbook to download
   * @returns Textbook metadata with local file path
   */
  async downloadTextbook(textbook: OpenStaxTextbook): Promise<TextbookMetadata> {
    logger.info(`Downloading: ${textbook.title}`);
    
    if (!textbook.downloadUrl) {
      throw new Error(`No download URL for ${textbook.title}`);
    }
    
    try {
      await this.ensureDirectoryExists(this.options.downloadDirectory);
      
      const fileName = `${textbook.id}.pdf`;
      const filePath = join(this.options.downloadDirectory, fileName);
      
      // Check if file already exists
      try {
        await fs.access(filePath);
        logger.info(`File already exists: ${fileName}`);
        
        const stats = await fs.stat(filePath);
        return {
          book: textbook.id,
          title: textbook.title,
          author: textbook.authors?.join(', '),
          subject: textbook.subject,
          url: textbook.downloadUrl,
          downloadDate: new Date().toISOString(),
          fileSize: stats.size,
          // pageCount will be determined during PDF processing
        };
      } catch {
        // File doesn't exist, proceed with download
      }
      
      const response = await axios({
        method: 'GET',
        url: textbook.downloadUrl,
        responseType: 'stream',
        timeout: this.options.timeout,
      });
      
      const writer = (await import('fs')).createWriteStream(filePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', async () => {
          try {
            const stats = await fs.stat(filePath);
            logger.info(`Downloaded: ${fileName} (${this.formatBytes(stats.size)})`);
            
            resolve({
              book: textbook.id,
              title: textbook.title,
              author: textbook.authors?.join(', '),
              subject: textbook.subject,
              url: textbook.downloadUrl,
              downloadDate: new Date().toISOString(),
              fileSize: stats.size,
            });
          } catch (error) {
            reject(error);
          }
        });
        
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error(`Error downloading ${textbook.title}:`, error);
      throw new Error(`Failed to download textbook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download multiple textbooks
   * @param textbooks - Array of textbooks to download
   * @returns Scraping result
   */
  async downloadTextbooks(textbooks: OpenStaxTextbook[]): Promise<ScrapingResult> {
    const startTime = Date.now();
    logger.info(`Starting download of ${textbooks.length} textbooks`);
    
    const downloadedBooks: TextbookMetadata[] = [];
    const errors: string[] = [];
    let totalSize = 0;
    
    // Process downloads with concurrency control
    const chunks = this.chunkArray(textbooks, this.options.maxConcurrentDownloads);
    
    for (const chunk of chunks) {
      const downloadPromises = chunk.map(async (textbook) => {
        try {
          const detailedTextbook = await this.getTextbookDetails(textbook);
          const metadata = await this.downloadTextbook(detailedTextbook);
          downloadedBooks.push(metadata);
          totalSize += metadata.fileSize || 0;
        } catch (error) {
          const errorMessage = `Failed to download ${textbook.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          logger.error(errorMessage);
        }
      });
      
      await Promise.all(downloadPromises);
    }
    
    const processingTime = Date.now() - startTime;
    
    const result: ScrapingResult = {
      downloadedBooks,
      errors,
      totalSize,
      processingTime,
    };
    
    logger.info(`Download complete: ${downloadedBooks.length} successful, ${errors.length} failed, ${this.formatBytes(totalSize)} total`);
    
    return result;
  }

  /**
   * Get predefined list of recommended textbooks
   * @returns Array of recommended textbooks
   */
  getRecommendedTextbooks(): OpenStaxTextbook[] {
    return [
      {
        id: 'algebra-and-trigonometry',
        title: 'Algebra and Trigonometry',
        subject: 'Mathematics',
        webUrl: 'https://openstax.org/details/books/algebra-and-trigonometry',
        downloadUrl: 'https://assets.openstax.org/oscms-prodcms/media/documents/AlgebraAndTrigonometry-WEB.pdf',
        description: 'Algebra and Trigonometry provides a comprehensive exploration of algebraic principles and trigonometric functions.',
      },
      {
        id: 'calculus-volume-1',
        title: 'Calculus Volume 1',
        subject: 'Mathematics',
        webUrl: 'https://openstax.org/details/books/calculus-volume-1',
        downloadUrl: 'https://assets.openstax.org/oscms-prodcms/media/documents/CalculusVolume1-WEB.pdf',
        description: 'Calculus Volume 1 covers functions, limits, derivatives, and integration.',
      },
      {
        id: 'college-physics',
        title: 'College Physics',
        subject: 'Physics',
        webUrl: 'https://openstax.org/details/books/college-physics',
        downloadUrl: 'https://assets.openstax.org/oscms-prodcms/media/documents/CollegePhysics-WEB.pdf',
        description: 'College Physics meets standard scope and sequence requirements for a two-semester introductory algebra-based physics course.',
      },
      {
        id: 'chemistry-2e',
        title: 'Chemistry 2e',
        subject: 'Chemistry',
        webUrl: 'https://openstax.org/details/books/chemistry-2e',
        downloadUrl: 'https://assets.openstax.org/oscms-prodcms/media/documents/Chemistry2e-WEB.pdf',
        description: 'Chemistry 2e is designed to meet the scope and sequence requirements of the two-semester general chemistry course.',
      },
      {
        id: 'biology-2e',
        title: 'Biology 2e',
        subject: 'Biology',
        webUrl: 'https://openstax.org/details/books/biology-2e',
        downloadUrl: 'https://assets.openstax.org/oscms-prodcms/media/documents/Biology2e-WEB.pdf',
        description: 'Biology 2e is designed to cover the scope and sequence requirements of a typical two-semester biology course.',
      },
    ];
  }

  /**
   * Generate a unique book ID from title
   * @param title - Book title
   * @returns Unique book ID
   */
  private generateBookId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Ensure directory exists
   * @param dirPath - Directory path
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Format bytes into human-readable string
   * @param bytes - Number of bytes
   * @returns Formatted string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Split array into chunks
   * @param array - Array to chunk
   * @param size - Chunk size
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
} 