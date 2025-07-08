import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from 'langchain/document';
import { ContentMetadata, PineconeConfig } from '../types/content.types.js';
import { logger } from '../utils/logger.js';

export class PineconeService {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;
  private vectorStore?: PineconeStore;
  private config: PineconeConfig;

  constructor(config: PineconeConfig) {
    this.config = config;
    this.pinecone = new Pinecone({
      apiKey: config.apiKey,
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    try {
      const index = this.pinecone.index(this.config.indexName);
      
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        { 
          pineconeIndex: index,
          namespace: 'content',
        }
      );
      
      logger.info('Pinecone vector store initialized');
    } catch (error) {
      logger.error('Error initializing Pinecone:', error);
      throw new Error('Failed to initialize Pinecone');
    }
  }

  /**
   * Search for similar content based on query
   */
  async searchSimilarContent(
    query: string,
    filter?: Partial<ContentMetadata>,
    k: number = 5
  ): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      const results = await this.vectorStore!.similaritySearch(
        query,
        k,
        filter
      );

      return results;
    } catch (error) {
      logger.error('Error searching similar content:', error);
      throw new Error('Failed to search content');
    }
  }

  /**
   * Add content to vector store
   */
  async addContent(
    content: string,
    metadata: ContentMetadata
  ): Promise<void> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      const document = new Document({
        pageContent: content,
        metadata: metadata as Record<string, any>,
      });

      await this.vectorStore!.addDocuments([document]);
      
      logger.info(`Added content to vector store: ${metadata.id}`);
    } catch (error) {
      logger.error('Error adding content:', error);
      throw new Error('Failed to add content');
    }
  }

  /**
   * Search for exercises by topic and difficulty
   */
  async searchExercises(
    topic: string,
    difficulty?: string,
    type?: string,
    limit: number = 10
  ): Promise<Document[]> {
    const filter: any = {
      topic,
    };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (type) {
      filter.type = type;
    }

    return await this.searchSimilarContent(topic, filter, limit);
  }

  /**
   * Get recommended content based on user's learning history
   */
  async getRecommendedContent(
    userId: string,
    recentTopics: string[],
    strugglingConcepts: string[],
    limit: number = 5
  ): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      // Create a query that combines recent topics and struggling concepts
      const query = `
        Topics: ${recentTopics.join(', ')}
        Areas needing improvement: ${strugglingConcepts.join(', ')}
        Find exercises that help with these concepts
      `;

      const results = await this.vectorStore!.similaritySearch(
        query,
        limit * 2 // Get more results to filter
      );

      // Filter and prioritize results based on struggling concepts
      const prioritizedResults = results
        .filter(doc => {
          const metadata = doc.metadata as ContentMetadata;
          return strugglingConcepts.some(concept => 
            metadata.tags?.includes(concept) || 
            metadata.topic.toLowerCase().includes(concept.toLowerCase())
          );
        })
        .slice(0, limit);

      // If not enough prioritized results, add some general recommendations
      if (prioritizedResults.length < limit) {
        const additionalResults = results
          .filter(doc => !prioritizedResults.includes(doc))
          .slice(0, limit - prioritizedResults.length);
        
        prioritizedResults.push(...additionalResults);
      }

      return prioritizedResults;
    } catch (error) {
      logger.error('Error getting recommended content:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  /**
   * Update content metadata
   */
  async updateContentMetadata(
    contentId: string,
    updates: Partial<ContentMetadata>
  ): Promise<void> {
    // Note: Pinecone doesn't support direct metadata updates
    // You would need to delete and re-insert the document
    // This is a simplified implementation
    logger.warn('Metadata update not fully implemented for Pinecone');
  }

  /**
   * Delete content from vector store
   */
  async deleteContent(contentId: string): Promise<void> {
    if (!this.vectorStore) {
      await this.initialize();
    }

    try {
      const index = this.pinecone.index(this.config.indexName);
      await index.namespace('content').deleteOne(contentId);
      
      logger.info(`Deleted content from vector store: ${contentId}`);
    } catch (error) {
      logger.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }
} 