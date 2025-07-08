#!/bin/bash

# Script to fetch environment variables from Parameter Store and create .env.local

echo "🔧 Fetching environment variables from Parameter Store..."

# Create or clear .env.local file
> .env.local

# Function to fetch parameter and add to .env.local
fetch_parameter() {
    local param_name=$1
    local env_name=$2
    
    echo "Fetching $param_name..."
    
    value=$(aws ssm get-parameter --name "$param_name" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$value" ]; then
        echo "$env_name=$value" >> .env.local
        echo "✅ Added $env_name"
    else
        echo "⚠️  Could not fetch $param_name"
    fi
}

# Fetch the Cognito parameters from Parameter Store
fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_AWS_REGION" "NEXT_PUBLIC_AWS_REGION"
fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_COGNITO_USER_POOL_ID" "NEXT_PUBLIC_COGNITO_USER_POOL_ID"
fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NEXT_PUBLIC_COGNITO_APP_CLIENT_ID" "NEXT_PUBLIC_COGNITO_APP_CLIENT_ID"
fetch_parameter "/amplify/d1zp9qcvdet6wr/main/NODE_ENV" "NODE_ENV"

# Optional: Fetch other parameters if needed
fetch_parameter "/spool/PINECONE_API_KEY" "PINECONE_API_KEY"
fetch_parameter "/spool/PINECONE_INDEX_NAME" "PINECONE_INDEX_NAME"
fetch_parameter "/spool/PINECONE_OPENAI_API_KEY" "PINECONE_OPENAI_API_KEY"
fetch_parameter "/spool/openai-api-key" "OPENAI_API_KEY"

echo ""
echo "📋 Created .env.local file with contents:"
echo "========================================"
cat .env.local

echo ""
echo "✅ Environment variables fetched successfully!"
echo ""
echo "🚀 Next Steps:"
echo "1. Restart your Next.js development server"
echo "2. Test the sign-in page"
echo ""
echo "💡 Note: .env.local is in .gitignore and won't be committed to git" 