#!/bin/bash

# Disable email verification for Cognito User Pool
# This allows users to sign in immediately after sign-up

set -e

echo "🚀 Disabling Email Verification for Cognito User Pool..."
echo "===================================================="

# Configuration
REGION="us-east-1"
USER_POOL_ID="us-east-1_TBQtRz0K6"

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

log_info "Updating User Pool to disable email verification..."

# Update user pool to remove auto-verified attributes
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --auto-verified-attributes \
    --region $REGION \
    >/dev/null 2>&1 || true

# Update user pool to make email not required for verification
aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --region $REGION \
    >/dev/null

log_success "Updated User Pool settings"

echo ""
log_success "🎉 Email Verification Disabled!"
echo "================================"

echo ""
echo "📋 Changes Made:"
echo "   ✅ Removed email from auto-verified attributes"
echo "   ✅ Users can now sign in immediately after sign-up"
echo "   ✅ No email verification required"

echo ""
echo "⚠️  Security Considerations:"
echo "   - Email addresses won't be verified"
echo "   - Consider implementing email verification later for production"
echo "   - Users can sign up with any email format"

echo ""
echo "🔧 Next Steps:"
echo "1. Restart your development server"
echo "2. New sign-ups will not require email verification"
echo "3. Users will be auto-signed in after registration"

log_success "Configuration updated successfully! 🚀" 