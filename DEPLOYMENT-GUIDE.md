# Spool Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────┐
│                 │     │        AWS Amplify           │
│   Users         │────▶│     Frontend (Next.js)       │
│                 │     │    spool.yourdomain.com      │
└─────────────────┘     └──────────────────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │   API Gateway / ALB   │
                        └──────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Auth Service   │       │ Content Service │       │Interview Service│
│   (ECS/ECR)     │       │   (ECS/ECR)     │       │   (ECS/ECR)     │
│   Port 3001     │       │   Port 3002     │       │   Port 8080     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  AWS Cognito    │       │   PostgreSQL    │       │   WebSocket     │
└─────────────────┘       │    Pinecone     │       └─────────────────┘
                          │    Langflow     │
                          └─────────────────┘
```

## Deployment Strategy

### 1. Frontend (AWS Amplify) - Already Deployed ✓
The frontend is already deployed to Amplify and doesn't need changes for the MVP.

### 2. Backend Services (ECS via CodeBuild)

All backend services should be deployed through the existing CodeBuild pipeline to ECR/ECS.

## Local Development

### Testing Authentication Locally

1. **Start Auth Service**:
```bash
cd spool-auth-service
npm install
npm run dev
```

2. **Frontend is already running**:
```bash
# In Spool directory
npm run dev
```

3. **Test Sign In**:
- Go to http://localhost:3000
- Click Sign In
- Use your Cognito credentials

The frontend will automatically use `http://localhost:3001` for auth service.

## Production Deployment

### Step 1: Deploy Auth Service to ECS

1. **Add to existing CodeBuild pipeline**:

Update your `buildspec.yml` to include auth service:

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      # Build auth service
      - echo Building auth service...
      - cd spool-auth-service
      - docker build -t spool-auth-service .
      - docker tag spool-auth-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-auth-service:latest
      - cd ..
      
      # Build content service
      - echo Building content service...
      - cd spool-content-service
      - docker build -t spool-content-service .
      - docker tag spool-content-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-content-service:latest
      - cd ..
      
      # Build interview service (existing)
      - echo Building interview service...
      - cd spool-backend
      - docker build -t spool-interview-service .
      - docker tag spool-interview-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-interview-service:latest
  post_build:
    commands:
      - echo Pushing images to ECR...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-auth-service:latest
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-content-service:latest
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/spool-interview-service:latest
```

2. **Create ECS Task Definitions**:

For Auth Service (`auth-service-task-def.json`):
```json
{
  "family": "spool-auth-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "spool-auth-service",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/spool-auth-service:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://main.d2k8k7o7xj5wqo.amplifyapp.com"
        }
      ],
      "secrets": [
        {
          "name": "COGNITO_USER_POOL_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:spool/cognito:userPoolId::"
        },
        {
          "name": "COGNITO_APP_CLIENT_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:spool/cognito:appClientId::"
        },
        {
          "name": "COGNITO_APP_CLIENT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:${AWS_ACCOUNT_ID}:secret:spool/cognito:appClientSecret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/spool-auth-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Update ALB Target Groups**:

Add new target group for auth service:
- Path pattern: `/auth/*`
- Target: Auth Service ECS tasks
- Port: 3001
- Health check: `/health`

### Step 2: Update Frontend Environment Variables

In AWS Amplify Console, add environment variables:

```
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.yourdomain.com
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://api.yourdomain.com
NEXT_PUBLIC_INTERVIEW_SERVICE_URL=wss://api.yourdomain.com
```

### Step 3: API Gateway / ALB Routing

Configure your ALB or API Gateway to route:
- `/auth/*` → Auth Service (port 3001)
- `/content/*` → Content Service (port 3002)
- `/interview/*` → Interview Service (port 8080)

## Environment Variables Summary

### Local Development
Frontend (`.env.local`):
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_INTERVIEW_SERVICE_URL=http://localhost:8080
```

Auth Service (`.env`):
```env
PORT=3001
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_TBQtRz0K6
COGNITO_APP_CLIENT_ID=2qlls9iq8b2des063h1prtoh66
COGNITO_APP_CLIENT_SECRET=<your-secret>
FRONTEND_URL=http://localhost:3000
```

### Production
Frontend (Amplify Environment Variables):
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.yourdomain.com
NEXT_PUBLIC_CONTENT_SERVICE_URL=https://api.yourdomain.com
NEXT_PUBLIC_INTERVIEW_SERVICE_URL=wss://api.yourdomain.com
```

Auth Service (ECS Task Definition):
- Uses AWS Secrets Manager for sensitive values
- Environment variables for non-sensitive config

## Security Considerations

1. **Secrets Management**:
   - Use AWS Secrets Manager for all sensitive values
   - Never commit secrets to git

2. **Network Security**:
   - Services in private subnets
   - ALB in public subnets
   - Security groups restrict traffic

3. **CORS Configuration**:
   - Auth service allows only frontend origin
   - Credentials included for cookie support

## Monitoring

1. **CloudWatch Logs**:
   - Each service logs to its own log group
   - `/ecs/spool-auth-service`
   - `/ecs/spool-content-service`
   - `/ecs/spool-interview-service`

2. **Health Checks**:
   - Auth: `GET /health`
   - Content: `GET /health`
   - Interview: `GET /health`

## Rollback Strategy

If issues occur:
1. ECS maintains previous task definition
2. Update service to use previous version
3. Frontend on Amplify can be rolled back via console 