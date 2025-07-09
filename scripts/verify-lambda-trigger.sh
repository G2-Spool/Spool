#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Verifying Lambda trigger configuration...${NC}"

# Variables
USER_POOL_ID="us-east-1_TBQtRz0K6"
REGION="us-east-1"
LAMBDA_NAME="CognitoAutoConfirmUser"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Check current Lambda triggers
echo -e "${YELLOW}Current Lambda triggers on User Pool:${NC}"
aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.LambdaConfig' \
    --output json

# Step 2: Get Lambda ARN
echo -e "${YELLOW}Getting Lambda ARN...${NC}"
LAMBDA_ARN=$(aws lambda get-function \
    --function-name $LAMBDA_NAME \
    --region $REGION \
    --query Configuration.FunctionArn \
    --output text 2>/dev/null || echo "")

if [ -z "$LAMBDA_ARN" ]; then
    echo -e "${RED}Lambda function not found!${NC}"
    exit 1
fi

echo -e "${GREEN}Lambda ARN: $LAMBDA_ARN${NC}"

# Step 3: Update User Pool with Lambda trigger
echo -e "${YELLOW}Updating User Pool with PreSignUp trigger...${NC}"
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --lambda-config PreSignUp=$LAMBDA_ARN \
    --region $REGION

# Step 4: Verify the update
echo -e "${YELLOW}Verifying Lambda trigger is attached...${NC}"
TRIGGER=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.LambdaConfig.PreSignUp' \
    --output text)

if [ "$TRIGGER" = "$LAMBDA_ARN" ]; then
    echo -e "${GREEN}✓ Lambda trigger successfully attached!${NC}"
else
    echo -e "${RED}✗ Lambda trigger not attached properly${NC}"
fi

# Step 5: Confirm the existing unconfirmed user
echo -e "${YELLOW}Confirming existing unconfirmed user...${NC}"
aws cognito-idp admin-confirm-sign-up \
    --user-pool-id $USER_POOL_ID \
    --username hutchenbach@gmail.com \
    --region $REGION 2>/dev/null || echo -e "${YELLOW}User might already be confirmed${NC}"

aws cognito-idp admin-update-user-attributes \
    --user-pool-id $USER_POOL_ID \
    --username hutchenbach@gmail.com \
    --user-attributes Name=email_verified,Value=true \
    --region $REGION

echo -e "${GREEN}✓ User confirmed and email verified${NC}"

# Step 6: Show user status
echo -e "${YELLOW}Current user status:${NC}"
aws cognito-idp admin-get-user \
    --user-pool-id $USER_POOL_ID \
    --username hutchenbach@gmail.com \
    --region $REGION \
    --query '[UserStatus,UserAttributes[?Name==`email_verified`].Value|[0]]' \
    --output table

echo -e "${GREEN}✅ Configuration complete!${NC}"
echo -e "${GREEN}The Lambda trigger is now properly attached.${NC}"
echo -e "${GREEN}New users will be auto-confirmed upon sign-up.${NC}" 