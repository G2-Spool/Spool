#!/bin/bash

# AWS Resources Setup Script for Spool Application
# This script creates the required AWS Cognito and Secrets Manager resources

set -e  # Exit on any error

echo "🚀 Setting up AWS Resources for Spool Application..."
echo "===================================================="

# Configuration
REGION="us-east-1"
USER_POOL_NAME="spool-user-pool"
APP_CLIENT_NAME="spool-app-client"
SECRET_NAME="spool/openai-api-key"

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

log_info "AWS Identity confirmed"
aws sts get-caller-identity --output table

echo ""
log_info "Step 1: Creating Cognito User Pool..."

# Check if user pool already exists
EXISTING_POOL=$(aws cognito-idp list-user-pools --max-results 10 --region $REGION --output json 2>/dev/null | jq -r ".UserPools[]? | select(.Name == \"$USER_POOL_NAME\") | .Id" 2>/dev/null || echo "")

if [ -n "$EXISTING_POOL" ]; then
    log_warning "User pool '$USER_POOL_NAME' already exists with ID: $EXISTING_POOL"
    USER_POOL_ID="$EXISTING_POOL"
else
    # Create user pool
    log_info "Creating user pool: $USER_POOL_NAME"
    
    USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool \
        --pool-name "$USER_POOL_NAME" \
        --policies '{
            "PasswordPolicy": {
                "MinimumLength": 8,
                "RequireUppercase": true,
                "RequireLowercase": true,
                "RequireNumbers": true,
                "RequireSymbols": false
            }
        }' \
        --auto-verified-attributes email \
        --username-attributes email \
        --schema '[{
            "Name": "email",
            "Required": true,
            "Mutable": true,
            "AttributeDataType": "String"
        }]' \
        --region $REGION \
        --output json)
    
    USER_POOL_ID=$(echo "$USER_POOL_OUTPUT" | jq -r '.UserPool.Id')
    log_success "Created user pool with ID: $USER_POOL_ID"
fi

echo ""
log_info "Step 2: Creating App Client..."

# Check if app client already exists
EXISTING_CLIENT=$(aws cognito-idp list-user-pool-clients \
    --user-pool-id "$USER_POOL_ID" \
    --region $REGION \
    --output json 2>/dev/null | jq -r ".UserPoolClients[]? | select(.ClientName == \"$APP_CLIENT_NAME\") | .ClientId" 2>/dev/null || echo "")

if [ -n "$EXISTING_CLIENT" ]; then
    log_warning "App client '$APP_CLIENT_NAME' already exists with ID: $EXISTING_CLIENT"
    APP_CLIENT_ID="$EXISTING_CLIENT"
    
    # Get client secret
    CLIENT_DETAILS=$(aws cognito-idp describe-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-id "$EXISTING_CLIENT" \
        --region $REGION \
        --output json)
    APP_CLIENT_SECRET=$(echo "$CLIENT_DETAILS" | jq -r '.UserPoolClient.ClientSecret // empty')
else
    # Create app client
    log_info "Creating app client: $APP_CLIENT_NAME"
    
    CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
        --user-pool-id "$USER_POOL_ID" \
        --client-name "$APP_CLIENT_NAME" \
        --generate-secret \
        --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
        --supported-identity-providers COGNITO \
        --region $REGION \
        --output json)
    
    APP_CLIENT_ID=$(echo "$CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientId')
    APP_CLIENT_SECRET=$(echo "$CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientSecret')
    log_success "Created app client with ID: $APP_CLIENT_ID"
fi

echo ""
log_info "Step 3: Setting up Secrets Manager..."

# Check if secret already exists
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region $REGION >/dev/null 2>&1; then
    log_warning "Secret '$SECRET_NAME' already exists"
    log_info "To update the secret value, run:"
    echo "aws secretsmanager put-secret-value --secret-id '$SECRET_NAME' --secret-string 'YOUR_OPENAI_API_KEY' --region $REGION"
else
    # Create secret
    log_info "Creating secret: $SECRET_NAME"
    
    aws secretsmanager create-secret \
        --name "$SECRET_NAME" \
        --description "OpenAI API key for Spool application" \
        --region $REGION >/dev/null
    
    log_success "Created secret: $SECRET_NAME"
    log_warning "You need to add your OpenAI API key value:"
    echo "aws secretsmanager put-secret-value --secret-id '$SECRET_NAME' --secret-string 'YOUR_OPENAI_API_KEY' --region $REGION"
fi

echo ""
log_info "Step 4: Creating Environment Configuration..."

# Create .env.local file
ENV_FILE=".env.local"

cat > "$ENV_FILE" << EOF
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=$REGION

# Cognito Configuration  
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID
COGNITO_APP_CLIENT_SECRET=$APP_CLIENT_SECRET

# Secrets Manager
SECRET_NAME_OPENAI_API_KEY=$SECRET_NAME
EOF

log_success "Created $ENV_FILE with configuration"

echo ""
log_success "🎉 AWS Resources Setup Complete!"
echo "=================================="

echo ""
echo "📋 Resource Summary:"
echo "   🔐 User Pool ID: $USER_POOL_ID"
echo "   📱 App Client ID: $APP_CLIENT_ID"
echo "   🔑 Secret Name: $SECRET_NAME"
echo "   🌍 Region: $REGION"

echo ""
echo "🔧 Next Steps:"
echo "1. Add your OpenAI API key to Secrets Manager:"
echo "   aws secretsmanager put-secret-value \\"
echo "     --secret-id '$SECRET_NAME' \\"
echo "     --secret-string 'YOUR_ACTUAL_OPENAI_API_KEY' \\"
echo "     --region $REGION"

echo ""
echo "2. Your environment file has been created: $ENV_FILE"
echo "   Review and adjust settings as needed."

echo ""
echo "3. Start your application:"
echo "   npm run dev"

echo ""
echo "🔒 Security Notes:"
echo "   - Keep your .env.local file secure and never commit it"
echo "   - Rotate your Cognito client secret regularly"
echo "   - Monitor AWS costs and usage"

log_success "Setup completed successfully! 🚀" 