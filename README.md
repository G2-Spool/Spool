# Spool Auth Service

Authentication microservice for the Spool educational platform using AWS Cognito.

## Features

- User registration and email verification
- User sign in/sign out
- Password reset functionality
- Token refresh
- JWT-based authentication
- User profile management

## Prerequisites

- Node.js 18+
- AWS Account with Cognito User Pool configured
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
- `COGNITO_USER_POOL_ID`: Your Cognito User Pool ID
- `COGNITO_APP_CLIENT_ID`: Your Cognito App Client ID
- `COGNITO_APP_CLIENT_SECRET`: Your Cognito App Client Secret

## Development

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /auth/signin` - Sign in with email and password
- `POST /auth/signup` - Register new user
- `POST /auth/confirm` - Confirm email with verification code
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Reset password with code
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile (requires auth)
- `POST /auth/signout` - Sign out user (requires auth)

### Health

- `GET /health` - Service health check
- `GET /health/ready` - Readiness check

## Architecture

This service follows a clean architecture pattern:

```
src/
├── routes/         # API route definitions
├── services/       # Business logic (Cognito integration)
├── middleware/     # Express middleware
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Security

- All passwords are handled by AWS Cognito
- JWT tokens are used for authentication
- CORS is configured for frontend access
- Helmet.js for security headers

## Deployment

1. Build the service:
```bash
npm run build
```

2. Deploy to your preferred platform (ECS, Lambda, etc.)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3001) | No |
| `AWS_REGION` | AWS region (default: us-east-1) | No |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID | Yes |
| `COGNITO_APP_CLIENT_SECRET` | Cognito App Client Secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `LOG_LEVEL` | Logging level (default: info) | No | 