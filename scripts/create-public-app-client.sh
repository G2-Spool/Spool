#!/bin/bash

# Create a public Cognito App Client for browser-based applications
# This client doesn't have a secret, making it suitable for frontend apps

set -e

echo "🚀 Creating Public Cognito App Client for Spool Frontend..."
echo "=================================================="

# Configuration
REGION="us-east-1"
USER_POOL_ID="us-east-1_TBQtRz0K6"
APP_CLIENT_NAME="spool-frontend-client"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    log_error "AWS CLI is not configured or credentials are invalid"
    echo "Please run: aws configure"
    exit 1
fi

log_info "Creating public app client (no secret) for frontend..."

# Check if client already exists
EXISTING_CLIENT=$(aws cognito-idp list-user-pool-clients \
    --user-pool-id "$USER_POOL_ID" \
    --region $REGION \
    --output json 2>/dev/null | jq -r ".UserPoolClients[]? | select(.ClientName == \"$APP_CLIENT_NAME\") | .ClientId" 2>/dev/null || echo "")

if [ -n "$EXISTING_CLIENT" ]; then
    log_warning "App client '$APP_CLIENT_NAME' already exists with ID: $EXISTING_CLIENT"
    APP_CLIENT_ID="$EXISTING_CLIENT"
else
    # Create app client WITHOUT secret for browser-based apps
    log_info "Creating app client: $APP_CLIENT_NAME"
    
    CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-name "$APP_CLIENT_NAME" \
        --no-generate-secret \
        --explicit-auth-flows "ALLOW_USER_SRP_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" \
        --supported-identity-providers COGNITO \
        --prevent-user-existence-errors ENABLED \
        --region $REGION \
        --output json)
    
    APP_CLIENT_ID=$(echo "$CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientId')
    log_success "Created public app client with ID: $APP_CLIENT_ID"
fi

echo ""
log_info "Updating .env.local with new client ID..."

# Create new .env.local file
cat > .env.local << EOF
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=$REGION

# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID

# Backend Service URLs (for future API Gateway integration)
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002

# Environment
NODE_ENV=development

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

log_success "Updated .env.local with public client configuration"

echo ""
log_success "🎉 Public App Client Setup Complete!"
echo "===================================="

echo ""
echo "📋 Configuration Summary:"
echo "   🔐 User Pool ID: $USER_POOL_ID"
echo "   📱 App Client ID: $APP_CLIENT_ID (no secret)"
echo "   🌍 Region: $REGION"

echo ""
echo "🔧 Next Steps:"
echo "1. Restart your Next.js development server:"
echo "   npm run dev"
echo ""
echo "2. The new client ID has been saved to .env.local"
echo ""
echo "3. You can now sign up and sign in from the browser!"

echo ""
echo "📝 Note: This client has no secret, making it suitable for frontend applications."
echo "   For backend services, use a different client with a secret."

log_success "Setup completed successfully! 🚀" 