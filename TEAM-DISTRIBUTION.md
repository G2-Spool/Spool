# Spool Team Distribution Guide

## Repository Structure

We have successfully created a microservices architecture with the following repositories:

### 1. **Frontend Repository** 
- **Repository**: `G2-Spool/Spool` (existing)
- **Technology**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Port**: 3000
- **Status**: ✅ Already deployed to AWS Amplify

### 2. **Authentication Service**
- **Repository**: `G2-Spool/spool-auth-service` (needs to be created)
- **Technology**: Express.js, TypeScript, AWS Cognito
- **Port**: 3001
- **Status**: 🔄 Ready to push (code complete)

### 3. **Content Service**
- **Repository**: `G2-Spool/spool-content-service` (needs to be created)
- **Technology**: Express.js, TypeScript, Langflow, Pinecone, PostgreSQL
- **Port**: 3002
- **Status**: 🔄 Ready to push (code complete)

### 4. **Interview Service**
- **Repository**: `G2-Spool/spool-backend` (existing)
- **Technology**: Python, FastAPI
- **Port**: 8080
- **Status**: ✅ Already exists with interview functionality

## Task Distribution Strategy

### **Team Lead / DevOps Engineer**
**Primary Responsibilities:**
- Set up GitHub repositories (spool-auth-service, spool-content-service)
- Configure CI/CD pipelines with AWS CodeBuild
- Set up ECS clusters and services
- Configure AWS RDS PostgreSQL and secrets management
- Set up monitoring and logging infrastructure

**Repositories to manage:**
- All repositories (admin access)
- Infrastructure as Code (if created)

### **Frontend Developer(s)**
**Primary Responsibilities:**
- Integrate authentication flows with auth service
- Implement content display and interaction features
- Connect to content service APIs
- Enhance UI/UX based on user feedback
- Implement responsive design improvements

**Repository:** `G2-Spool/Spool`

**Key Integration Points:**
- `/lib/api-config.ts` - API configuration
- `/contexts/auth-context.tsx` - Authentication context
- `/components/pages/sign-in-page.tsx` - Sign-in integration
- `/app/api/auth/*` - Auth API routes (proxy to auth service)

### **Backend Developer 1: Authentication Service**
**Primary Responsibilities:**
- Maintain and enhance authentication service
- Implement additional security features
- Add rate limiting and advanced validation
- Integrate with AWS Secrets Manager
- Write comprehensive tests

**Repository:** `G2-Spool/spool-auth-service`

**Key Features to Implement:**
- Email verification flows
- Password reset functionality
- Multi-factor authentication (future)
- Session management
- Security audit logging

### **Backend Developer 2: Content Service**
**Primary Responsibilities:**
- Develop AI-powered content generation
- Implement Langflow integration
- Set up Pinecone vector database
- Create recommendation algorithms
- Implement learning analytics

**Repository:** `G2-Spool/spool-content-service`

**Key Features to Implement:**
- Exercise generation with Langflow
- Cognitive assessment algorithms
- Vector search with Pinecone
- Learning path optimization
- Performance analytics

### **Backend Developer 3: Interview Service**
**Primary Responsibilities:**
- Enhance existing interview functionality
- Integrate with content service for personalized interviews
- Implement voice processing improvements
- Add interview analytics
- Create interview scheduling system

**Repository:** `G2-Spool/spool-backend`

**Key Features to Enhance:**
- Voice interview processing
- Interview result analysis
- Integration with learning paths
- Real-time interview feedback
- Interview scheduling and management

## Setup Instructions

### 1. **Create GitHub Repositories**
```bash
# Run the setup script
./setup-github-repos.sh
```

### 2. **Local Development Setup**

**Authentication Service:**
```bash
cd spool-auth-service
npm install
cp .env.example .env
# Configure AWS Cognito credentials
npm run dev
```

**Content Service:**
```bash
cd spool-content-service
npm install
cp .env.example .env
# Configure Langflow, Pinecone, and PostgreSQL
npm run dev
```

**Frontend:**
```bash
cd Spool
npm install
npm run dev
```

### 3. **Environment Variables Setup**

**Auth Service (.env):**
```env
PORT=3001
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_TBQtRz0K6
COGNITO_APP_CLIENT_ID=2qlls9iq8b2des063h1prtoh66
COGNITO_APP_CLIENT_SECRET=<from_aws_secrets>
FRONTEND_URL=http://localhost:3000
```

**Content Service (.env):**
```env
PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/spool_content
PINECONE_API_KEY=<your_pinecone_key>
PINECONE_INDEX_NAME=spool-content-index
LANGFLOW_API_URL=http://localhost:7860
OPENAI_API_KEY=<your_openai_key>
```

## Development Workflow

### **Branch Strategy**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature branches
- `hotfix/issue-name` - Critical bug fixes

### **Code Review Process**
1. Create feature branch from `develop`
2. Implement feature with tests
3. Create pull request to `develop`
4. Require at least 1 reviewer approval
5. Merge to `develop` after approval
6. Deploy to staging for testing
7. Merge to `main` for production deployment

### **Testing Strategy**
- Unit tests for all services
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance tests for AI operations

## Deployment Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│   AWS Amplify   │     │     Application      │
│   (Frontend)    │────▶│    Load Balancer     │
│   Port: 3000    │     │                      │
└─────────────────┘     └──────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Auth Service  │      │ Content Service │      │Interview Service│
│   ECS Fargate   │      │   ECS Fargate   │      │   ECS Fargate   │
│   Port: 3001    │      │   Port: 3002    │      │   Port: 8080    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  AWS Cognito    │      │   PostgreSQL    │      │   File Storage  │
│                 │      │   (RDS)         │      │   (S3)          │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   Pinecone      │
                         │ (Vector DB)     │
                         └─────────────────┘
```

## Communication & Coordination

### **Daily Standups**
- What did you work on yesterday?
- What will you work on today?
- Any blockers or dependencies?

### **Weekly Planning**
- Review sprint progress
- Plan upcoming features
- Discuss architecture decisions
- Address technical debt

### **Tools**
- **Code**: GitHub repositories
- **Communication**: Slack/Discord
- **Project Management**: GitHub Projects or Jira
- **Documentation**: GitHub Wiki or Notion

## Getting Started Checklist

### **Team Lead**
- [ ] Create GitHub repositories
- [ ] Set up CI/CD pipelines
- [ ] Configure AWS infrastructure
- [ ] Set up monitoring and logging
- [ ] Invite team members to repositories

### **Frontend Developer**
- [ ] Clone Spool repository
- [ ] Set up local development environment
- [ ] Review API integration points
- [ ] Plan UI enhancements
- [ ] Set up testing framework

### **Backend Developers**
- [ ] Clone assigned repository
- [ ] Set up local development environment
- [ ] Configure external dependencies
- [ ] Review existing code and architecture
- [ ] Plan feature implementations

## Success Metrics

- **Code Quality**: 80%+ test coverage, clean code reviews
- **Performance**: <200ms API response times, 99.9% uptime
- **Security**: No security vulnerabilities, proper authentication
- **User Experience**: Smooth authentication flows, personalized content
- **Team Velocity**: Consistent sprint completions, minimal blockers

## Support & Resources

- **Architecture Documentation**: `MVP-ARCHITECTURE.md`
- **Deployment Guide**: `DEPLOYMENT-GUIDE.md`
- **API Documentation**: Each service's README.md
- **AWS Resources**: IAM roles, Cognito setup, RDS configuration
- **Development Tools**: Docker, AWS CLI, Node.js, Python

---

**Ready to start? Run `./setup-github-repos.sh` to begin!** 