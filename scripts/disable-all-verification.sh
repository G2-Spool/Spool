#!/bin/bash

# Script to completely disable email verification in Cognito User Pool

USER_POOL_ID="us-east-1_TBQtRz0K6"
CLIENT_ID="2bdesb5u92d8irnqjvprn8aooo"

echo "🔧 Disabling ALL email verification requirements..."
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo

# Step 1: Update User Pool to remove auto-verified attributes and verification
echo "1. Updating User Pool configuration..."
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --auto-verified-attributes \
    --user-attribute-update-settings AttributesRequireVerificationBeforeUpdate=

if [ $? -eq 0 ]; then
    echo "✅ Removed auto-verified attributes from User Pool"
else
    echo "❌ Failed to update User Pool configuration"
fi

# Step 2: Update User Pool Client to prevent user existence errors
echo
echo "2. Updating User Pool Client configuration..."
aws cognito-idp update-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --prevent-user-existence-errors ENABLED \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH

if [ $? -eq 0 ]; then
    echo "✅ Updated User Pool Client configuration"
else
    echo "❌ Failed to update User Pool Client"
fi

# Step 3: Confirm any existing unconfirmed users
echo
echo "3. Checking for unconfirmed users..."
USERS=$(aws cognito-idp list-users --user-pool-id $USER_POOL_ID --filter "status = \"UNCONFIRMED\"" --query 'Users[].Username' --output text)

if [ -z "$USERS" ]; then
    echo "✅ No unconfirmed users found"
else
    echo "Found unconfirmed users. Confirming them..."
    for USERNAME in $USERS; do
        echo "   Confirming user: $USERNAME"
        aws cognito-idp admin-confirm-sign-up --user-pool-id $USER_POOL_ID --username "$USERNAME" 2>/dev/null
        
        # Also set email_verified to true
        aws cognito-idp admin-update-user-attributes \
            --user-pool-id $USER_POOL_ID \
            --username "$USERNAME" \
            --user-attributes Name=email_verified,Value=true 2>/dev/null
            
        if [ $? -eq 0 ]; then
            echo "   ✅ Confirmed user: $USERNAME"
        else
            echo "   ⚠️  Could not confirm user: $USERNAME (may already be confirmed)"
        fi
    done
fi

# Step 4: Create a Lambda trigger to auto-confirm users (Pre Sign-up trigger)
echo
echo "4. Creating Lambda function for auto-confirmation..."

# Create Lambda function code
cat > auto-confirm-lambda.js << 'EOF'
exports.handler = async (event) => {
    // Auto-confirm the user
    event.response.autoConfirmUser = true;
    
    // Set email as verified
    if (event.request.userAttributes.hasOwnProperty('email')) {
        event.response.autoVerifyEmail = true;
    }
    
    // Set phone as verified (if applicable)
    if (event.request.userAttributes.hasOwnProperty('phone_number')) {
        event.response.autoVerifyPhone = true;
    }
    
    console.log('Auto-confirmed user:', event.request.userAttributes.email || event.userName);
    
    return event;
};
EOF

# Create zip file
zip -j auto-confirm-lambda.zip auto-confirm-lambda.js

# Create IAM role for Lambda (if it doesn't exist)
ROLE_NAME="CognitoAutoConfirmLambdaRole"
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null)

if [ -z "$ROLE_ARN" ]; then
    echo "Creating IAM role for Lambda..."
    
    # Create trust policy
    cat > trust-policy.json << 'EOF'
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

    ROLE_ARN=$(aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Wait for role to be ready
    sleep 10
fi

# Create or update Lambda function
FUNCTION_NAME="CognitoAutoConfirmUser"
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text 2>/dev/null)

if [ -z "$FUNCTION_ARN" ]; then
    echo "Creating Lambda function..."
    FUNCTION_ARN=$(aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler auto-confirm-lambda.handler \
        --zip-file fileb://auto-confirm-lambda.zip \
        --timeout 30 \
        --memory-size 128 \
        --query 'FunctionArn' \
        --output text)
else
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://auto-confirm-lambda.zip
fi

# Add permission for Cognito to invoke Lambda
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id CognitoInvokePermission \
    --action lambda:InvokeFunction \
    --principal cognito-idp.amazonaws.com \
    --source-arn arn:aws:cognito-idp:us-east-1:*:userpool/$USER_POOL_ID 2>/dev/null

# Step 5: Attach Lambda to Cognito User Pool
echo
echo "5. Attaching Lambda trigger to User Pool..."
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --lambda-config PreSignUp=$FUNCTION_ARN

if [ $? -eq 0 ]; then
    echo "✅ Lambda trigger attached successfully"
else
    echo "❌ Failed to attach Lambda trigger"
fi

# Clean up temporary files
rm -f auto-confirm-lambda.js auto-confirm-lambda.zip trust-policy.json

echo
echo "✅ Configuration complete!"
echo
echo "Summary:"
echo "- Removed email verification requirements"
echo "- Enabled prevent user existence errors"
echo "- Confirmed all existing unconfirmed users"
echo "- Created Lambda trigger to auto-confirm new users"
echo
echo "Users can now sign up and immediately sign in without email verification!" 