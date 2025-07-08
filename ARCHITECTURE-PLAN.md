# Spool Platform Architecture Plan

## Overview

The Spool educational platform requires a microservices architecture with proper separation of concerns, utilizing AWS RDS Postgres, Neo4j, and Pinecone vector store for different data needs.

## Repository Structure

### Current State
```
p4/
├── Spool/              # Frontend (Next.js) - AWS Amplify
└── spool-backend/      # Backend services - AWS ECS
    └── services/
        └── interview/  # Voice interview service
```

### Recommended Repository Architecture
```
spool-platform/
├── spool-frontend/           # Next.js UI (current Spool repo)
├── spool-api-gateway/        # GraphQL/REST API Gateway
├── spool-auth-service/       # Authentication & Authorization
├── spool-interview-service/  # Voice interview (from spool-backend)
├── spool-content-service/    # Educational content management
├── spool-analytics-service/  # Learning analytics & progress
├── spool-recommendation-service/ # AI-powered recommendations
├── spool-infrastructure/     # Shared infrastructure (CDK/Terraform)
└── spool-shared-libs/        # Shared TypeScript/Python libraries
```

## Database Architecture

### 1. **AWS RDS PostgreSQL** (Primary Transactional Data)
**Purpose**: Core application data, user profiles, course structures
```sql
-- Core tables
- users
- courses
- enrollments
- progress_tracking
- assessments
- submissions
```

### 2. **Neo4j Graph Database** (Relationship Mapping)
**Purpose**: Complex relationships between concepts, prerequisites, learning paths
```cypher
-- Graph nodes
- (:Student)
- (:Course)
- (:Topic)
- (:Skill)
- (:LearningPath)

-- Relationships
- [:ENROLLED_IN]
- [:PREREQUISITE_OF]
- [:MASTERED]
- [:RECOMMENDS]
```

### 3. **Pinecone Vector Store** (Semantic Search & Recommendations)
**Purpose**: Content embeddings, semantic search, personalized recommendations
```python
# Vectors for:
- Course content embeddings
- Student interest profiles
- Learning material similarity
- Question-answer pairs
```

## Service Architecture

### 1. **API Gateway Service** (`spool-api-gateway`)
- **Technology**: Apollo GraphQL Server + Express
- **Deployment**: ECS Fargate
- **Responsibilities**:
  - Unified API interface
  - Request routing
  - Authentication middleware
  - Rate limiting
  - GraphQL schema stitching

### 2. **Authentication Service** (`spool-auth-service`)
- **Technology**: Node.js + Express
- **Deployment**: ECS Fargate
- **Integrations**:
  - AWS Cognito (already set up)
  - JWT token management
  - Role-based access control
- **Database**: RDS PostgreSQL (users table)

### 3. **Interview Service** (`spool-interview-service`)
- **Technology**: Python FastAPI (existing)
- **Deployment**: ECS Fargate (already configured)
- **Features**:
  - WebSocket for real-time audio
  - Speech-to-text processing
  - GPT-4 conversation flow
- **Database**: RDS PostgreSQL (interview_sessions)

### 4. **Content Service** (`spool-content-service`)
- **Technology**: Node.js + Express
- **Deployment**: ECS Fargate
- **Responsibilities**:
  - Course CRUD operations
  - Content versioning
  - Media management (S3)
- **Databases**: 
  - RDS PostgreSQL (content metadata)
  - S3 (media files)
  - Pinecone (content embeddings)

### 5. **Analytics Service** (`spool-analytics-service`)
- **Technology**: Python FastAPI
- **Deployment**: ECS Fargate
- **Features**:
  - Progress tracking
  - Performance analytics
  - Learning insights
- **Databases**:
  - RDS PostgreSQL (analytics data)
  - Neo4j (learning path analysis)

### 6. **Recommendation Service** (`spool-recommendation-service`)
- **Technology**: Python FastAPI
- **Deployment**: ECS Fargate
- **ML Components**:
  - Content recommendation
  - Learning path optimization
  - Difficulty adjustment
- **Databases**:
  - Neo4j (graph traversal)
  - Pinecone (similarity search)
  - AWS Bedrock (AI inference)

## Infrastructure Setup Steps

### Phase 1: Database Infrastructure

#### 1.1 RDS PostgreSQL Setup
```bash
# Using AWS CLI with AI Assistant Role
aws rds create-db-instance \
  --db-instance-identifier spool-postgres-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --allocated-storage 100 \
  --storage-encrypted \
  --master-username spooladmin \
  --master-user-password <stored-in-secrets-manager> \
  --vpc-security-group-ids <security-group-id> \
  --db-subnet-group-name spool-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "Mon:04:00-Mon:05:00" \
  --multi-az \
  --no-publicly-accessible
```

#### 1.2 Neo4j Setup Options

**Option A: Neo4j Aura (Managed)**
- Sign up for Neo4j Aura Professional
- Create instance via Neo4j console
- Store credentials in AWS Secrets Manager

**Option B: Self-hosted on ECS**
```yaml
# neo4j-task-definition.json
{
  "family": "spool-neo4j",
  "taskRoleArn": "arn:aws:iam::560281064968:role/spool-ecs-task-role",
  "executionRoleArn": "arn:aws:iam::560281064968:role/spool-ecs-execution-role",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "containerDefinitions": [{
    "name": "neo4j",
    "image": "neo4j:5.12-enterprise",
    "environment": [
      {"name": "NEO4J_AUTH", "value": "neo4j/changeme"},
      {"name": "NEO4J_ACCEPT_LICENSE_AGREEMENT", "value": "yes"}
    ],
    "mountPoints": [{
      "sourceVolume": "neo4j-data",
      "containerPath": "/data"
    }]
  }]
}
```

#### 1.3 Pinecone Setup
```python
# Initialize Pinecone (in recommendation service)
import pinecone

pinecone.init(
    api_key=get_secret("spool/pinecone-api-key"),
    environment="us-east-1"
)

# Create indexes
pinecone.create_index(
    "spool-content-embeddings",
    dimension=1536,  # OpenAI embedding dimension
    metric="cosine"
)

pinecone.create_index(
    "spool-user-profiles",
    dimension=768,   # Custom profile dimension
    metric="euclidean"
)
```

### Phase 2: Service Migration Plan

#### Step 1: Extract Interview Service
```bash
# From spool-backend
cd spool-backend/services/interview
cp -r . ../../../spool-interview-service/

# Create new repository
cd ../../../spool-interview-service
git init
git remote add origin https://github.com/G2-Spool/spool-interview-service.git
```

#### Step 2: Create API Gateway
```bash
# New repository
mkdir spool-api-gateway
cd spool-api-gateway
npm init -y
npm install apollo-server-express graphql express
```

#### Step 3: Update Frontend Environment
```env
# .env.local
NEXT_PUBLIC_API_GATEWAY_URL=https://api.spool.education
NEXT_PUBLIC_WS_URL=wss://api.spool.education/interview
```

### Phase 3: Container Configuration

#### Dockerfile Template for Node.js Services
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Dockerfile Template for Python Services
```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Phase 4: CI/CD Pipeline Updates

#### CodeBuild Project for Each Service
```json
{
  "name": "spool-{service-name}-build",
  "source": {
    "type": "GITHUB",
    "location": "https://github.com/G2-Spool/spool-{service-name}.git"
  },
  "artifacts": {
    "type": "NO_ARTIFACTS"
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": true
  }
}
```

## Security Considerations

### Network Architecture
```
VPC: spool-vpc (10.0.0.0/16)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   └── ALB, NAT Gateways
├── Private Subnets (10.0.10.0/24, 10.0.11.0/24)
│   └── ECS Services, Lambda
└── Database Subnets (10.0.20.0/24, 10.0.21.0/24)
    └── RDS, Neo4j
```

### Service Communication
- Internal services communicate via AWS PrivateLink
- External API access through API Gateway only
- All secrets stored in AWS Secrets Manager
- Service-to-service auth via IAM roles

## Cost Optimization

### Estimated Monthly Costs
- **RDS PostgreSQL** (Multi-AZ, 100GB): ~$200
- **Neo4j Aura**: ~$300 (or self-hosted on ECS: ~$150)
- **Pinecone** (Starter): ~$70
- **ECS Fargate** (6 services): ~$300
- **ALB**: ~$25
- **Total**: ~$895-1,045/month

### Cost Saving Strategies
1. Use Fargate Spot for non-critical services
2. Implement auto-scaling policies
3. Use RDS proxy for connection pooling
4. Schedule dev environment shutdown

## Implementation Timeline

### Week 1-2: Infrastructure Setup
- [ ] Create RDS PostgreSQL instance
- [ ] Set up Neo4j (Aura or self-hosted)
- [ ] Configure Pinecone indexes
- [ ] Update security groups and VPC

### Week 3-4: Service Extraction
- [ ] Extract interview service to new repo
- [ ] Create API gateway service
- [ ] Set up authentication service
- [ ] Update CI/CD pipelines

### Week 5-6: New Services
- [ ] Implement content service
- [ ] Create analytics service
- [ ] Build recommendation service
- [ ] Integration testing

### Week 7-8: Migration & Testing
- [ ] Migrate existing data
- [ ] Update frontend connections
- [ ] Load testing
- [ ] Security audit

## Next Immediate Steps

1. **Create RDS Instance** (using AI Assistant role)
2. **Set up Neo4j** (choose Aura vs self-hosted)
3. **Configure Pinecone** account and indexes
4. **Create new GitHub repositories** for services
5. **Extract interview service** to standalone repo

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Independent deployment capabilities
- ✅ Scalable microservices design
- ✅ Appropriate database for each use case
- ✅ Cost-effective infrastructure
- ✅ Security best practices 