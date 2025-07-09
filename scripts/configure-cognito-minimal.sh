#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Configuring Cognito User Pool for auto-confirmation...${NC}"

# Variables
USER_POOL_ID="us-east-1_TBQtRz0K6"
APP_CLIENT_ID="2bdesb5u92d8irnqjvprn8aooo"
REGION="us-east-1"

# Step 1: Update User Pool to auto-confirm users
echo -e "${YELLOW}Updating User Pool configuration...${NC}"

# Create Lambda function for auto-confirmation
LAMBDA_CODE='
exports.handler = async (event) => {
    // Auto-confirm the user
    event.response.autoConfirmUser = true;
    
    // Set email as verified if it exists
    if (event.request.userAttributes.email) {
        event.response.autoVerifyEmail = true;
    }
    
    // Set phone as verified if it exists  
    if (event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    }
    
    return event;
};
'

# Create the Lambda function
echo "$LAMBDA_CODE" > /tmp/auto-confirm-lambda.js

# Package the Lambda
cd /tmp
zip auto-confirm-lambda.zip auto-confirm-lambda.js

# Create Lambda function
echo -e "${YELLOW}Creating Lambda function for auto-confirmation...${NC}"
LAMBDA_ARN=$(aws lambda create-function \
    --function-name CognitoAutoConfirmUser \
    --runtime nodejs18.x \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/LambdaBasicExecutionRole \
    --handler auto-confirm-lambda.handler \
    --zip-file fileb://auto-confirm-lambda.zip \
    --region $REGION \
    --query FunctionArn \
    --output text 2>/dev/null || \
    aws lambda get-function \
        --function-name CognitoAutoConfirmUser \
        --region $REGION \
        --query Configuration.FunctionArn \
        --output text)

echo -e "${GREEN}Lambda ARN: $LAMBDA_ARN${NC}"

# Grant Cognito permission to invoke the Lambda
echo -e "${YELLOW}Granting Cognito permission to invoke Lambda...${NC}"
aws lambda add-permission \
    --function-name CognitoAutoConfirmUser \
    --statement-id CognitoInvokeFunction \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:$REGION:$(aws sts get-caller-identity --query Account --output text):userpool/$USER_POOL_ID \
    --region $REGION 2>/dev/null || true

# Update User Pool with Lambda trigger
echo -e "${YELLOW}Adding Lambda trigger to User Pool...${NC}"
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --lambda-config PreSignUp=$LAMBDA_ARN \
    --region $REGION

# Step 2: Update Password Policy to be more lenient
echo -e "${YELLOW}Updating password policy...${NC}"
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --policies "PasswordPolicy={MinimumLength=6,RequireUppercase=false,RequireLowercase=true,RequireNumbers=false,RequireSymbols=false}" \
    --region $REGION

# Step 3: List and confirm any unconfirmed users
echo -e "${YELLOW}Checking for unconfirmed users...${NC}"

# Get list of all users
USERS=$(aws cognito-idp list-users \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'Users[?UserStatus==`UNCONFIRMED`].Username' \
    --output json)

# Confirm each unconfirmed user
if [ "$USERS" != "[]" ]; then
    echo -e "${YELLOW}Found unconfirmed users. Confirming them...${NC}"
    
    # Parse JSON array and confirm each user
    echo $USERS | jq -r '.[]' | while read username; do
        echo -e "${YELLOW}Confirming user: $username${NC}"
        
        # Admin confirm the user
        aws cognito-idp admin-confirm-sign-up \
            --user-pool-id $USER_POOL_ID \
            --username "$username" \
            --region $REGION
        
        echo -e "${GREEN}✓ User $username confirmed${NC}"
    done
else
    echo -e "${GREEN}No unconfirmed users found${NC}"
fi

# Step 4: Clean up
rm -f /tmp/auto-confirm-lambda.js /tmp/auto-confirm-lambda.zip

echo -e "${GREEN}✅ Cognito configuration complete!${NC}"
echo -e "${GREEN}Users will now be automatically confirmed upon sign-up.${NC}" 