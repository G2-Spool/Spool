#!/bin/bash

# Script to configure Amplify environment variables from Parameter Store

APP_ID="d1zp9qcvdet6wr"
BRANCH_NAME="main"

echo "🔧 Configuring Amplify environment variables..."
echo "App ID: $APP_ID"
echo "Branch: $BRANCH_NAME"

# Function to fetch parameter value
fetch_parameter() {
    local param_name=$1
    aws ssm get-parameter --name "$param_name" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null
}

# Fetch values from Parameter Store
echo "1. Fetching values from Parameter Store..."

AWS_REGION=$(fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_AWS_REGION")
USER_POOL_ID=$(fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_COGNITO_USER_POOL_ID")
APP_CLIENT_ID=$(fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_COGNITO_APP_CLIENT_ID")
NODE_ENV=$(fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NODE_ENV")

# Optional: Fetch other parameters
PINECONE_API_KEY=$(fetch_parameter "/spool/PINECONE_API_KEY")
PINECONE_INDEX_NAME=$(fetch_parameter "/spool/PINECONE_INDEX_NAME")
OPENAI_API_KEY=$(fetch_parameter "/spool/openai-api-key")

echo "✅ Values fetched from Parameter Store"

# Configure Amplify environment variables
echo ""
echo "2. Setting Amplify environment variables..."

# Set the required Cognito environment variables
if [ ! -z "$AWS_REGION" ]; then
    aws amplify update-app --app-id $APP_ID --environment-variables NEXT_PUBLIC_AWS_REGION="$AWS_REGION"
    echo "✅ Set NEXT_PUBLIC_AWS_REGION"
fi

if [ ! -z "$USER_POOL_ID" ]; then
    aws amplify update-app --app-id $APP_ID --environment-variables NEXT_PUBLIC_COGNITO_USER_POOL_ID="$USER_POOL_ID"
    echo "✅ Set NEXT_PUBLIC_COGNITO_USER_POOL_ID"
fi

if [ ! -z "$APP_CLIENT_ID" ]; then
    aws amplify update-app --app-id $APP_ID --environment-variables NEXT_PUBLIC_COGNITO_APP_CLIENT_ID="$APP_CLIENT_ID"
    echo "✅ Set NEXT_PUBLIC_COGNITO_APP_CLIENT_ID"
fi

if [ ! -z "$NODE_ENV" ]; then
    aws amplify update-app --app-id $APP_ID --environment-variables NODE_ENV="$NODE_ENV"
    echo "✅ Set NODE_ENV"
fi

# Set all environment variables in one command (more efficient)
echo ""
echo "3. Setting all environment variables at once..."

ENV_VARS="NEXT_PUBLIC_AWS_REGION=$AWS_REGION"
ENV_VARS="$ENV_VARS,NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID"
ENV_VARS="$ENV_VARS,NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID"

if [ ! -z "$NODE_ENV" ]; then
    ENV_VARS="$ENV_VARS,NODE_ENV=$NODE_ENV"
fi

if [ ! -z "$PINECONE_API_KEY" ]; then
    ENV_VARS="$ENV_VARS,PINECONE_API_KEY=$PINECONE_API_KEY"
fi

if [ ! -z "$PINECONE_INDEX_NAME" ]; then
    ENV_VARS="$ENV_VARS,PINECONE_INDEX_NAME=$PINECONE_INDEX_NAME"
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
    ENV_VARS="$ENV_VARS,OPENAI_API_KEY=$OPENAI_API_KEY"
fi

# Update all environment variables
aws amplify update-app --app-id $APP_ID --environment-variables "$ENV_VARS"

if [ $? -eq 0 ]; then
    echo "✅ All environment variables configured successfully!"
else
    echo "❌ Failed to configure some environment variables"
fi

echo ""
echo "4. Triggering new deployment..."

# Start a new build with the updated environment variables
aws amplify start-job --app-id $APP_ID --branch-name $BRANCH_NAME --job-type RELEASE

if [ $? -eq 0 ]; then
    echo "✅ New deployment started successfully!"
    echo "🚀 Your app should be updated in a few minutes"
else
    echo "❌ Failed to start new deployment"
fi

echo ""
echo "📋 Configuration Summary:"
echo "========================="
echo "App ID: $APP_ID"
echo "Branch: $BRANCH_NAME"
echo "AWS Region: $AWS_REGION"
echo "User Pool ID: $USER_POOL_ID"
echo "App Client ID: $APP_CLIENT_ID"
echo ""
echo "🔗 Check deployment status at:"
echo "https://console.aws.amazon.com/amplify/home?region=us-east-1#/$APP_ID/$BRANCH_NAME"
echo ""
echo "🌐 Your app will be available at:"
echo "https://main.d1zp9qcvdet6wr.amplifyapp.com/"

echo ""
echo "✅ Configuration complete!" 