#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing Cognito user confirmation issue...${NC}"

# Variables
USER_POOL_ID="us-east-1_TBQtRz0K6"
REGION="us-east-1"

# Step 1: Find and confirm the unconfirmed user
echo -e "${YELLOW}Looking for the unconfirmed user...${NC}"

# Try to confirm by email
EMAIL="hutchenbach@gmail.com"
echo -e "${YELLOW}Attempting to confirm user with email: $EMAIL${NC}"

# First, try to admin confirm sign up
aws cognito-idp admin-confirm-sign-up \
    --user-pool-id $USER_POOL_ID \
    --username "$EMAIL" \
    --region $REGION 2>/dev/null && echo -e "${GREEN}✓ User confirmed by email${NC}" || echo -e "${YELLOW}Could not confirm by email, trying by user ID...${NC}"

# Also try with the user ID from the console
USER_ID="94f8e4f8-e0f1-7012-e857-54e0f12147e6"
aws cognito-idp admin-confirm-sign-up \
    --user-pool-id $USER_POOL_ID \
    --username "$USER_ID" \
    --region $REGION 2>/dev/null && echo -e "${GREEN}✓ User confirmed by ID${NC}" || echo -e "${YELLOW}User might already be confirmed${NC}"

# Step 2: Set email as verified
echo -e "${YELLOW}Setting email as verified...${NC}"

# Try both email and user ID
aws cognito-idp admin-update-user-attributes \
    --user-pool-id $USER_POOL_ID \
    --username "$EMAIL" \
    --user-attributes Name=email_verified,Value=true \
    --region $REGION 2>/dev/null || \
aws cognito-idp admin-update-user-attributes \
    --user-pool-id $USER_POOL_ID \
    --username "$USER_ID" \
    --user-attributes Name=email_verified,Value=true \
    --region $REGION 2>/dev/null

echo -e "${GREEN}✓ Email verification status updated${NC}"

# Step 3: List all users to verify status
echo -e "${YELLOW}Current user status:${NC}"
aws cognito-idp list-users \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'Users[?Username==`'$EMAIL'` || Username==`'$USER_ID'`].[Username,UserStatus,UserCreateDate,Attributes[?Name==`email_verified`].Value|[0]]' \
    --output table

echo -e "${GREEN}✅ User confirmation fix complete!${NC}"
echo -e "${GREEN}You should now be able to sign in with your email and password.${NC}" 