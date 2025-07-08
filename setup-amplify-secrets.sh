#!/bin/bash

# Setup AWS SSM Parameters for Amplify
# This script sets up secrets in AWS Systems Manager Parameter Store for Amplify to use

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
AWS_REGION="us-east-1"
AMPLIFY_APP_ID="d1zp9qcvdet6wr"
BRANCH_NAME="main"
PARAMETER_PATH="/amplify/${AMPLIFY_APP_ID}/${BRANCH_NAME}"

print_status "Setting up AWS SSM Parameters for Amplify..."
print_status "App ID: ${AMPLIFY_APP_ID}"
print_status "Branch: ${BRANCH_NAME}"
print_status "Parameter Path: ${PARAMETER_PATH}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "AWS CLI configured successfully"

# Function to create SSM parameter
create_parameter() {
    local param_name=$1
    local param_value=$2
    local param_type=${3:-"String"}
    local description=$4
    
    print_status "Creating parameter: ${PARAMETER_PATH}/${param_name}"
    
    aws ssm put-parameter \
        --region ${AWS_REGION} \
        --name "${PARAMETER_PATH}/${param_name}" \
        --value "${param_value}" \
        --type "${param_type}" \
        --description "${description}" \
        --overwrite \
        --tier "Standard" || {
        print_error "Failed to create parameter: ${param_name}"
        return 1
    }
    
    print_success "Created parameter: ${param_name}"
}

# Create parameters
print_status "Creating Amplify environment parameters..."

# Public configuration (can be String type)
create_parameter "NEXT_PUBLIC_AWS_REGION" "us-east-1" "String" "AWS region for the application"
create_parameter "NEXT_PUBLIC_COGNITO_USER_POOL_ID" "us-east-1_TBQtRz0K6" "String" "Cognito User Pool ID"
create_parameter "NEXT_PUBLIC_COGNITO_APP_CLIENT_ID" "2qlls9iq8b2des063h1prtoh66" "String" "Cognito App Client ID"
create_parameter "NODE_ENV" "production" "String" "Node environment"

# Sensitive configuration (SecureString type)
print_warning "You need to provide the sensitive values..."

# Prompt for sensitive values
read -p "Enter Cognito App Client Secret: " -s COGNITO_SECRET
echo
create_parameter "COGNITO_APP_CLIENT_SECRET" "${COGNITO_SECRET}" "SecureString" "Cognito App Client Secret"

read -p "Enter Auth Service URL (https://your-auth-service.com): " AUTH_SERVICE_URL
create_parameter "NEXT_PUBLIC_AUTH_SERVICE_URL" "${AUTH_SERVICE_URL}" "String" "Auth service endpoint URL"

read -p "Enter Content Service URL (https://your-content-service.com): " CONTENT_SERVICE_URL
create_parameter "NEXT_PUBLIC_CONTENT_SERVICE_URL" "${CONTENT_SERVICE_URL}" "String" "Content service endpoint URL"

read -p "Enter App URL (https://your-app.amplifyapp.com): " APP_URL
create_parameter "NEXT_PUBLIC_APP_URL" "${APP_URL}" "String" "Frontend application URL"

print_success "All parameters created successfully!"

# List created parameters
print_status "Created parameters:"
aws ssm get-parameters-by-path \
    --region ${AWS_REGION} \
    --path "${PARAMETER_PATH}" \
    --query "Parameters[].Name" \
    --output table

print_success "Setup complete!"
print_warning "Next steps:"
echo "1. Verify Amplify service role has SSM permissions"
echo "2. Trigger a new build in Amplify"
echo "3. Check build logs for successful secret loading" 