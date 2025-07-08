# Spool MVP Architecture

## Overview

The Spool MVP follows a microservices architecture with three main services:

1. **Frontend (spool)**: Next.js 15 application
2. **Auth Service (spool-auth-service)**: Handles authentication via AWS Cognito
3. **Content Service (spool-content-service)**: Manages content generation and assessment
4. **Interview Service (spool-backend)**: Handles voice interviews

## Directory Structure

```
p4/
├── Spool/                    # Frontend (Next.js)
├── spool-auth-service/       # Authentication microservice
├── spool-content-service/    # Content generation & assessment
└── spool-backend/           # Interview service (existing)
```

## Services

### 1. Frontend Service (Spool)
- **Port**: 3000
- **Technology**: Next.js 15, React 18, TypeScript
- **Features**:
  - User interface for learning platform
  - Sign-in/Sign-up pages
  - Dashboard and progress tracking
  - Exercise interface
  - Voice interview integration

### 2. Auth Service
- **Port**: 3001
- **Technology**: Express, TypeScript, AWS Cognito
- **Endpoints**:
  - `POST /auth/signin` - User sign in
  - `POST /auth/signup` - User registration
  - `POST /auth/confirm` - Email verification
  - `POST /auth/signout` - Sign out
  - `GET /auth/me` - Get user profile
  - `POST /auth/refresh` - Refresh tokens
  - `POST /auth/forgot-password` - Password reset
  - `POST /auth/reset-password` - Confirm password reset

### 3. Content Service
- **Port**: 3002
- **Technology**: Express, TypeScript, Langflow, Pinecone, PostgreSQL
- **Features**:
  - Exercise generation based on student needs
  - Cognitive assessment of answers
  - Learning path management
  - Personalized recommendations
- **Endpoints**:
  - `POST /content/generate-exercise` - Generate new exercise
  - `POST /content/assess-answer` - Assess student answer
  - `GET /content/recommendations` - Get personalized recommendations
  - `GET /content/stats` - User statistics
  - `GET /content/learning-path` - Get learning path
  - `POST /content/learning-path/update` - Update learning path

### 4. Interview Service (spool-backend)
- **Port**: 8080
- **Technology**: Python, FastAPI, WebSocket
- **Features**:
  - Voice-based student interviews
  - Real-time interest detection
  - Speech-to-text and text-to-speech

## Data Architecture

### PostgreSQL (RDS)
- **Tables**:
  - `exercise_attempts` - Student exercise history
  - `learning_paths` - User learning progress
  - `generated_exercises` - Exercise repository

### Pinecone Vector Store
- **Purpose**: Semantic search and content recommendations
- **Index**: `spool-content`
- **Namespace**: `content`

### Neo4j (Future)
- **Purpose**: Graph relationships for learning paths
- **Not implemented in MVP**

## Integration Flow

### Authentication Flow
1. User signs in via frontend
2. Frontend calls auth service
3. Auth service validates with Cognito
4. JWT tokens returned and stored as HTTP-only cookies

### Content Generation Flow
1. User requests new exercise
2. Frontend calls content service with auth token
3. Content service:
   - Retrieves user's learning path from PostgreSQL
   - Searches similar content in Pinecone
   - Generates exercise via Langflow
   - Stores in PostgreSQL and Pinecone
4. Exercise returned to frontend

### Assessment Flow
1. Student submits answer
2. Content service:
   - Assesses answer via Langflow
   - Performs cognitive analysis
   - Updates learning path
   - Generates adaptive exercises if needed
3. Feedback returned to student

## Environment Variables

### Frontend (.env.local)
```env
# API Service URLs
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_INTERVIEW_SERVICE_URL=http://localhost:8080

# AWS Cognito (for direct integration)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_TBQtRz0K6
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=2qlls9iq8b2des063h1prtoh66
COGNITO_APP_CLIENT_SECRET=<secret>
```

### Auth Service (.env)
```env
# Server
NODE_ENV=development
PORT=3001

# AWS
AWS_REGION=us-east-1

# Cognito
COGNITO_USER_POOL_ID=us-east-1_TBQtRz0K6
COGNITO_APP_CLIENT_ID=2qlls9iq8b2des063h1prtoh66
COGNITO_APP_CLIENT_SECRET=<secret>

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Content Service (.env)
```env
# Server
NODE_ENV=development
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spool
DB_USER=postgres
DB_PASSWORD=<password>

# Langflow
LANGFLOW_BASE_URL=http://localhost:7860
LANGFLOW_FLOW_ID=<flow-id>
LANGFLOW_API_KEY=<api-key>

# Pinecone
PINECONE_API_KEY=<api-key>
PINECONE_ENVIRONMENT=<environment>
PINECONE_INDEX_NAME=spool-content

# OpenAI (for embeddings)
OPENAI_API_KEY=<api-key>

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Running the MVP

### Prerequisites
1. AWS Account with Cognito configured
2. PostgreSQL database running
3. Pinecone account and index created
4. Langflow instance running
5. Node.js 18+ and Python 3.8+

### Start Services

1. **Start Interview Service** (in spool-backend/):
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

2. **Start Auth Service** (in spool-auth-service/):
```bash
npm install
npm run dev
```

3. **Start Content Service** (in spool-content-service/):
```bash
npm install
npm run dev
```

4. **Start Frontend** (in Spool/):
```bash
npm install
npm run dev
```

## API Communication

All services communicate via REST APIs with JWT authentication:

```typescript
// Frontend API calls
const response = await fetch('http://localhost:3001/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

// Authenticated calls
const exerciseResponse = await fetch('http://localhost:3002/content/generate-exercise', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    topic: 'algebra',
    difficulty: 'intermediate',
    learningObjectives: ['solving equations'],
  }),
});
```

## Security Considerations

1. **Authentication**: JWT tokens with Cognito validation
2. **CORS**: Configured for frontend origin only
3. **HTTPS**: Required for production
4. **Secrets**: Stored in environment variables
5. **Database**: Connection pooling with timeouts
6. **Rate Limiting**: To be implemented

## Next Steps

1. **Deployment**:
   - Containerize services with Docker
   - Deploy to AWS ECS or Lambda
   - Set up API Gateway

2. **Monitoring**:
   - CloudWatch logs
   - Application metrics
   - Error tracking

3. **Scaling**:
   - Auto-scaling groups
   - Database read replicas
   - Caching layer (Redis)

4. **Features**:
   - Neo4j integration for graph relationships
   - Advanced analytics
   - Multi-language support 