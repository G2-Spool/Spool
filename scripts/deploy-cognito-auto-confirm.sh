#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Deploying Cognito Auto-Confirm Lambda ===${NC}"

# Variables
USER_POOL_ID="us-east-1_TBQtRz0K6"
APP_CLIENT_ID="2bdesb5u92d8irnqjvprn8aooo"
REGION="us-east-1"
LAMBDA_NAME="CognitoAutoConfirmUser"
ROLE_NAME="CognitoAutoConfirmLambdaRole"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create IAM role for Lambda
echo -e "${YELLOW}Creating IAM role for Lambda...${NC}"

# Create trust policy
cat > /tmp/lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
    --region $REGION 2>/dev/null || echo -e "${YELLOW}Role already exists${NC}"

# Attach basic execution policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    --region $REGION 2>/dev/null || true

# Wait for role to be ready
echo -e "${YELLOW}Waiting for IAM role to propagate...${NC}"
sleep 10

# Step 2: Package and create Lambda function
echo -e "${YELLOW}Creating Lambda function...${NC}"

# Create a zip file with the Lambda code
cd lambda
zip -q cognito-auto-confirm.zip cognito-auto-confirm.js
cd ..

# Create or update the Lambda function
LAMBDA_ARN=$(aws lambda create-function \
    --function-name $LAMBDA_NAME \
    --runtime nodejs18.x \
    --role arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME} \
    --handler cognito-auto-confirm.handler \
    --zip-file fileb://lambda/cognito-auto-confirm.zip \
    --timeout 30 \
    --memory-size 128 \
    --region $REGION \
    --query FunctionArn \
    --output text 2>/dev/null || \
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --zip-file fileb://lambda/cognito-auto-confirm.zip \
        --region $REGION \
        --query FunctionArn \
        --output text)

echo -e "${GREEN}Lambda ARN: $LAMBDA_ARN${NC}"

# Step 3: Grant Cognito permission to invoke Lambda
echo -e "${YELLOW}Granting Cognito permission to invoke Lambda...${NC}"

# Remove existing permission if it exists
aws lambda remove-permission \
    --function-name $LAMBDA_NAME \
    --statement-id CognitoInvokeFunction \
    --region $REGION 2>/dev/null || true

# Add permission
aws lambda add-permission \
    --function-name $LAMBDA_NAME \
    --statement-id CognitoInvokeFunction \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID} \
    --region $REGION

# Step 4: Update User Pool to use the Lambda trigger
echo -e "${YELLOW}Updating Cognito User Pool with Lambda trigger...${NC}"

# Update User Pool with Pre Sign-up trigger
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --lambda-config PreSignUp=$LAMBDA_ARN \
    --region $REGION

echo -e "${GREEN}✓ Lambda trigger configured${NC}"

# Step 5: Update password policy to be more user-friendly
echo -e "${YELLOW}Updating password policy...${NC}"

aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --policies "PasswordPolicy={MinimumLength=6,RequireUppercase=false,RequireLowercase=true,RequireNumbers=false,RequireSymbols=false}" \
    --region $REGION

echo -e "${GREEN}✓ Password policy updated${NC}"

# Step 6: Confirm any existing unconfirmed users
echo -e "${YELLOW}Checking for unconfirmed users...${NC}"

# Get list of unconfirmed users
UNCONFIRMED_USERS=$(aws cognito-idp list-users \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'Users[?UserStatus==`UNCONFIRMED`].Username' \
    --output json)

if [ "$UNCONFIRMED_USERS" != "[]" ]; then
    echo -e "${YELLOW}Found unconfirmed users. Confirming them...${NC}"
    
    # Parse JSON array and confirm each user
    echo $UNCONFIRMED_USERS | jq -r '.[]' | while read username; do
        echo -e "${YELLOW}Confirming user: $username${NC}"
        
        # Admin confirm the user
        aws cognito-idp admin-confirm-sign-up \
            --user-pool-id $USER_POOL_ID \
            --username "$username" \
            --region $REGION
        
        # Set email as verified
        aws cognito-idp admin-update-user-attributes \
            --user-pool-id $USER_POOL_ID \
            --username "$username" \
            --user-attributes Name=email_verified,Value=true \
            --region $REGION
        
        echo -e "${GREEN}✓ User $username confirmed${NC}"
    done
else
    echo -e "${GREEN}No unconfirmed users found${NC}"
fi

# Step 7: Test the Lambda function
echo -e "${YELLOW}Testing Lambda function...${NC}"

# Create test event
cat > /tmp/test-event.json <<EOF
{
  "version": "1",
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "userName": "testuser",
  "callerContext": {
    "awsSdkVersion": "aws-sdk-unknown-unknown",
    "clientId": "$APP_CLIENT_ID"
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

# Invoke the function
aws lambda invoke \
    --function-name $LAMBDA_NAME \
    --payload file:///tmp/test-event.json \
    /tmp/lambda-response.json \
    --region $REGION

echo -e "${GREEN}Lambda test response:${NC}"
cat /tmp/lambda-response.json | jq .

# Clean up
rm -f lambda/cognito-auto-confirm.zip
rm -f /tmp/lambda-trust-policy.json
rm -f /tmp/test-event.json
rm -f /tmp/lambda-response.json

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Your Cognito User Pool is now configured to:${NC}"
echo -e "${GREEN}  • Auto-confirm new users${NC}"
echo -e "${GREEN}  • Auto-verify email addresses${NC}"
echo -e "${GREEN}  • Allow immediate sign-in after sign-up${NC}"
echo
echo -e "${BLUE}Users can now sign up and immediately sign in without any email verification!${NC}" 