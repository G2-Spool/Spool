#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Fixing Lambda permissions for Cognito...${NC}"

# Variables
USER_POOL_ID="us-east-1_TBQtRz0K6"
REGION="us-east-1"
LAMBDA_NAME="CognitoAutoConfirmUser"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${YELLOW}Account ID: $ACCOUNT_ID${NC}"

# Step 1: Remove any existing permission (to avoid conflicts)
echo -e "${YELLOW}Removing existing permissions...${NC}"
aws lambda remove-permission \
    --function-name $LAMBDA_NAME \
    --statement-id CognitoInvokeFunction \
    --region $REGION 2>/dev/null || echo -e "${YELLOW}No existing permission to remove${NC}"

# Step 2: Add permission for Cognito to invoke the Lambda
echo -e "${YELLOW}Adding permission for Cognito to invoke Lambda...${NC}"
aws lambda add-permission \
    --function-name $LAMBDA_NAME \
    --statement-id CognitoInvokeFunction \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID} \
    --region $REGION

echo -e "${GREEN}✓ Permission added${NC}"

# Step 3: Verify the permission was added
echo -e "${YELLOW}Verifying Lambda permissions...${NC}"
aws lambda get-policy \
    --function-name $LAMBDA_NAME \
    --region $REGION \
    --query Policy \
    --output text | jq .

# Step 4: Test the Lambda function with a Cognito event
echo -e "${YELLOW}Testing Lambda function...${NC}"

cat > /tmp/test-cognito-event.json <<EOF
{
  "version": "1",
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "userName": "testuser",
  "callerContext": {
    "awsSdkVersion": "aws-sdk-unknown-unknown",
    "clientId": "2bdesb5u92d8irnqjvprn8aooo"
  },
  "triggerSource": "PreSignUp_SignUp",
  "request": {
    "userAttributes": {
      "email": "test@example.com"
    }
  },
  "response": {}
}
EOF

aws lambda invoke \
    --function-name $LAMBDA_NAME \
    --payload file:///tmp/test-cognito-event.json \
    /tmp/lambda-test-response.json \
    --region $REGION

echo -e "${GREEN}Lambda test response:${NC}"
cat /tmp/lambda-test-response.json | jq .

# Clean up
rm -f /tmp/test-cognito-event.json /tmp/lambda-test-response.json

echo -e "${GREEN}✅ Lambda permissions fixed!${NC}"
echo -e "${GREEN}Cognito can now invoke the Lambda function.${NC}"
echo -e "${GREEN}Try signing up a new user - they should be auto-confirmed!${NC}" 