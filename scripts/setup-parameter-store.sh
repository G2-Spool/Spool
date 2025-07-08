#!/bin/bash

# Script to move secrets from .env.local to AWS Systems Manager Parameter Store

# Configuration
REGION="us-east-1"
ENV_FILE=".env.local"
PARAMETER_PREFIX="/spool/production"

echo "🔧 Setting up AWS Systems Manager Parameter Store..."

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

# Step 1: Create parameters from .env.local
echo "1. Creating parameters from $ENV_FILE..."

echo ""
echo "📋 Parameters to be created:"
echo "================================"

# Read .env.local and create parameters
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Extract key and value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^"//; s/"$//')
        
        # Determine parameter type
        if [[ "$key" == *"SECRET"* || "$key" == *"PASSWORD"* || "$key" == *"KEY"* ]]; then
            param_type="SecureString"
            echo "🔐 $PARAMETER_PREFIX/$key (SecureString)"
        else
            param_type="String"
            echo "📝 $PARAMETER_PREFIX/$key (String)"
        fi
        
        # Create parameter
        aws ssm put-parameter \
            --name "$PARAMETER_PREFIX/$key" \
            --value "$value" \
            --type "$param_type" \
            --overwrite \
            --region "$REGION" \
            --description "Spool application parameter for $key" \
            > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ Created: $PARAMETER_PREFIX/$key"
        else
            echo "❌ Failed to create: $PARAMETER_PREFIX/$key"
        fi
    fi
done < "$ENV_FILE"

# Step 2: Create IAM policy for Parameter Store access
echo ""
echo "2. Creating IAM policy for Parameter Store access..."

cat > /tmp/parameter-store-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            "Resource": "arn:aws:ssm:$REGION:*:parameter$PARAMETER_PREFIX/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": "arn:aws:kms:$REGION:*:key/*",
            "Condition": {
                "StringEquals": {
                    "kms:ViaService": "ssm.$REGION.amazonaws.com"
                }
            }
        }
    ]
}
EOF

POLICY_NAME="SpoolParameterStorePolicy"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/parameter-store-policy.json \
    --description "Policy for Spool Parameter Store access"

if [ $? -eq 0 ]; then
    echo "✅ IAM policy created successfully"
else
    echo "⚠️  Policy might already exist or failed to create"
fi

# Step 3: Create example code for reading parameters
echo ""
echo "3. Creating example code for reading parameters..."

cat > "lib/parameter-store.ts" << 'EOF'
import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from "@aws-sdk/client-ssm"

const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' })

export async function getParameter(name: string): Promise<string | null> {
  try {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true
    })
    
    const response = await client.send(command)
    return response.Parameter?.Value || null
  } catch (error) {
    console.error(`Failed to get parameter ${name}:`, error)
    return null
  }
}

export async function getParametersByPath(path: string): Promise<Record<string, string>> {
  try {
    const command = new GetParametersByPathCommand({
      Path: path,
      Recursive: true,
      WithDecryption: true
    })
    
    const response = await client.send(command)
    const parameters: Record<string, string> = {}
    
    if (response.Parameters) {
      for (const param of response.Parameters) {
        if (param.Name && param.Value) {
          // Remove the path prefix to get the key name
          const key = param.Name.replace(path + '/', '')
          parameters[key] = param.Value
        }
      }
    }
    
    return parameters
  } catch (error) {
    console.error(`Failed to get parameters from path ${path}:`, error)
    return {}
  }
}

// Usage example for production configuration
export async function getProductionConfig() {
  const config = await getParametersByPath('/spool/production')
  
  return {
    region: config.NEXT_PUBLIC_AWS_REGION,
    userPoolId: config.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: config.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID,
    authServiceUrl: config.NEXT_PUBLIC_AUTH_SERVICE_URL,
    contentServiceUrl: config.NEXT_PUBLIC_CONTENT_SERVICE_URL,
    appUrl: config.NEXT_PUBLIC_APP_URL
  }
}
EOF

echo "✅ Parameter Store utility created at lib/parameter-store.ts"

# Step 4: Create production environment configuration
echo ""
echo "4. Creating production environment configuration..."

cat > ".env.production" << 'EOF'
# Production environment - uses Parameter Store
NODE_ENV=production

# These will be loaded from Parameter Store in production
# NEXT_PUBLIC_AWS_REGION=us-east-1
# NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_TBQtRz0K6
# NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=2bdesb5u92d8irnqjvprn8aooo
# NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.spool.ai
# NEXT_PUBLIC_CONTENT_SERVICE_URL=https://content.spool.ai
# NEXT_PUBLIC_APP_URL=https://spool.ai
EOF

echo "✅ Production environment template created"

# Step 5: Update package.json with AWS SDK dependency
echo ""
echo "5. Checking AWS SDK dependencies..."

if ! grep -q "@aws-sdk/client-ssm" package.json; then
    echo "⚠️  @aws-sdk/client-ssm not found in package.json"
    echo "💡 Run: npm install @aws-sdk/client-ssm"
else
    echo "✅ AWS SDK SSM client dependency found"
fi

# Clean up
rm -f /tmp/parameter-store-policy.json

echo ""
echo "📋 Setup Summary:"
echo "================================"
echo "Parameter Prefix: $PARAMETER_PREFIX"
echo "Region: $REGION"
echo "Policy Name: $POLICY_NAME"
echo ""
echo "📝 Created Files:"
echo "• lib/parameter-store.ts - Parameter Store utility"
echo "• .env.production - Production environment template"
echo ""
echo "📋 Parameters Created:"
aws ssm describe-parameters --parameter-filters "Key=Name,Option=BeginsWith,Values=$PARAMETER_PREFIX" --region $REGION --query 'Parameters[].Name' --output table

echo ""
echo "✅ Parameter Store setup complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Install AWS SDK: npm install @aws-sdk/client-ssm"
echo "2. Update your production deployment to use Parameter Store"
echo "3. Test parameter retrieval in your application"
echo "4. Remove .env.local from production deployments"
echo "" 