# Spool Content Service

A microservice for AI-powered content generation and personalized learning assessments, built with Express.js, TypeScript, and integrated with Langflow, Pinecone, and PostgreSQL.

## Features

- **AI Content Generation**: Langflow integration for creating personalized exercises
- **Cognitive Assessment**: Adaptive learning path generation based on user performance
- **Vector Search**: Pinecone integration for semantic content matching
- **Exercise Management**: CRUD operations for learning exercises
- **Learning Analytics**: Track user progress and performance metrics
- **Personalized Recommendations**: AI-driven content suggestions
- **Database Integration**: PostgreSQL for persistent data storage
- **RESTful API**: Clean API design for frontend integration

## API Endpoints

### Content Generation
- `POST /content/generate-exercise` - Generate personalized exercise
- `POST /content/assess-cognitive` - Perform cognitive assessment
- `GET /content/exercises/:id` - Get exercise by ID
- `PUT /content/exercises/:id` - Update exercise
- `DELETE /content/exercises/:id` - Delete exercise

### Recommendations
- `GET /content/recommendations/:userId` - Get personalized recommendations
- `POST /content/search` - Semantic search for content

### Analytics
- `GET /content/analytics/:userId` - Get user learning analytics
- `POST /content/track-attempt` - Track exercise attempt

### Health
- `GET /health` - Service health check

## Environment Variables

```env
PORT=3002
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/spool_content
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=spool-content-index
LANGFLOW_API_URL=http://localhost:7860
LANGFLOW_API_KEY=your-langflow-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up PostgreSQL database**:
```bash
# Create database
createdb spool_content

# Run migrations (if using migrations)
npm run migrate
```

4. **Run in development mode**:
```bash
npm run dev
```

5. **Build for production**:
```bash
npm run build
npm start
```

## Docker Deployment

```bash
# Build image
docker build -t spool-content-service .

# Run container
docker run -p 3002:3002 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e PINECONE_API_KEY=your-key \
  -e LANGFLOW_API_URL=http://langflow:7860 \
  spool-content-service
```

## Dependencies Setup

### PostgreSQL
```sql
-- Create database
CREATE DATABASE spool_content;

-- Example table structure
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    difficulty INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_attempts (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER REFERENCES exercises(id),
    user_id VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Pinecone
1. Create a Pinecone account and project
2. Create an index with dimension 1536 (for OpenAI embeddings)
3. Configure the API key and index name

### Langflow
1. Deploy Langflow instance
2. Create flows for content generation and assessment
3. Configure API endpoints and authentication

## Architecture

```
src/
├── index.ts                    # Application entry point
├── integrations/              # External service integrations
│   ├── langflow.service.ts
│   └── pinecone.service.ts
├── middleware/                # Express middleware
│   ├── error.middleware.ts
│   ├── logging.middleware.ts
│   └── validation.middleware.ts
├── routes/                    # API routes
│   ├── content.routes.ts
│   └── health.routes.ts
├── services/                  # Business logic
│   ├── content.service.ts
│   └── database.service.ts
├── types/                     # TypeScript types
│   └── content.types.ts
└── utils/                     # Utilities
    └── logger.ts
```

## AI Integration

### Langflow Integration
- **Content Generation**: Uses Langflow flows to generate personalized exercises
- **Cognitive Assessment**: Analyzes user responses to adapt difficulty
- **Learning Path**: Creates dynamic learning sequences

### Pinecone Integration
- **Semantic Search**: Find similar content based on vector embeddings
- **Content Matching**: Match user preferences with available content
- **Recommendation Engine**: Suggest relevant exercises and materials

## Data Models

### Exercise
```typescript
interface Exercise {
  id: string;
  userId: string;
  subject: string;
  difficulty: number;
  content: {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  };
  createdAt: Date;
}
```

### Exercise Attempt
```typescript
interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  score: number;
  timeSpent: number;
  attemptedAt: Date;
}
```

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Security Considerations

- Input validation for all API endpoints
- Rate limiting on content generation endpoints
- Secure database connections
- API key management via environment variables
- CORS configuration for frontend access

## Monitoring

- Health check endpoint at `/health`
- Structured logging with Winston
- Performance metrics for AI operations
- Database query monitoring
- Error tracking and alerting

## Performance Optimization

- Database connection pooling
- Caching for frequently accessed content
- Batch processing for bulk operations
- Async processing for AI operations
- Response compression

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## License

MIT 