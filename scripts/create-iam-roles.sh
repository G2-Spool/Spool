#!/bin/bash

# Create IAM Roles for Spool Application
# This script creates the AI Assistant and Student roles with proper permissions

set -e

echo "🔐 Creating IAM Roles for Spool Application..."
echo "=============================================="

# Configuration
ACCOUNT_ID="560281064968"
REGION="us-east-1"
USER_POOL_ID="us-east-1_TBQtRz0K6"
APP_CLIENT_ID="2qlls9iq8b2des063h1prtoh66"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Create AI Assistant Trust Policy
cat > ai-assistant-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${ACCOUNT_ID}:user/ShpoolBot"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "spool-ai-assistant-external-id"
        }
      }
    }
  ]
}
EOF

# Create AI Assistant Permissions Policy
cat > ai-assistant-permissions.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CognitoManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:ListUserPools",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:UpdateUserPoolClient",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:ListUsers"
      ],
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    },
    {
      "Sid": "SecretsManagerManagement",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:UpdateSecret",
        "secretsmanager:TagResource",
        "secretsmanager:ListSecrets"
      ],
      "Resource": [
        "arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:spool/*"
      ]
    },
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:CreateKnowledgeBase",
        "bedrock:GetKnowledgeBase",
        "bedrock:ListKnowledgeBases",
        "bedrock:UpdateKnowledgeBase",
        "bedrock:CreateDataSource",
        "bedrock:GetDataSource",
        "bedrock:ListDataSources",
        "bedrock:StartIngestionJob",
        "bedrock:GetIngestionJob",
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3AccessForRAG",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy"
      ],
      "Resource": [
        "arn:aws:s3:::spool-*",
        "arn:aws:s3:::spool-*/*"
      ]
    },
    {
      "Sid": "OpenSearchServerlessForRAG",
      "Effect": "Allow",
      "Action": [
        "aoss:CreateCollection",
        "aoss:DeleteCollection",
        "aoss:ListCollections",
        "aoss:DescribeCollection",
        "aoss:CreateSecurityPolicy",
        "aoss:GetSecurityPolicy",
        "aoss:ListSecurityPolicies",
        "aoss:CreateAccessPolicy",
        "aoss:GetAccessPolicy",
        "aoss:ListAccessPolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaForProcessing",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:InvokeFunction",
        "lambda:GetFunction",
        "lambda:ListFunctions",
        "lambda:DeleteFunction"
      ],
      "Resource": "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:spool-*"
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::${ACCOUNT_ID}:role/spool-*",
        "arn:aws:iam::${ACCOUNT_ID}:role/service-role/spool-*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:${REGION}:${ACCOUNT_ID}:log-group:/aws/lambda/spool-*"
    },
    {
      "Sid": "CostAndBillingRead",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetDimensionValues",
        "pricing:DescribeServices",
        "pricing:GetAttributeValues",
        "pricing:GetProducts"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create Student Trust Policy
cat > student-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}:aud": "${APP_CLIENT_ID}"
        }
      }
    }
  ]
}
EOF

# Create Student Permissions Policy
cat > student-permissions.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInference",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:${REGION}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:${REGION}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    },
    {
      "Sid": "BedrockKnowledgeBaseQuery",
      "Effect": "Allow",
      "Action": [
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "arn:aws:bedrock:${REGION}:${ACCOUNT_ID}:knowledge-base/spool-*"
    },
    {
      "Sid": "S3UserContent",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::spool-user-content/\${cognito-identity.amazonaws.com:sub}/*"
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "Spool/UserActivity"
        }
      }
    }
  ]
}
EOF

# Create Assume Role Policy for ShpoolBot
cat > assume-role-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::${ACCOUNT_ID}:role/SpoolAIAssistantRole"
    }
  ]
}
EOF

# Function to create role if it doesn't exist
create_role_if_not_exists() {
    local role_name="$1"
    local trust_policy_file="$2"
    
    if aws iam get-role --role-name "$role_name" >/dev/null 2>&1; then
        log_warning "Role $role_name already exists, skipping creation"
    else
        log_info "Creating role: $role_name"
        aws iam create-role \
            --role-name "$role_name" \
            --assume-role-policy-document "file://$trust_policy_file" \
            --region "$REGION"
        log_success "Created role: $role_name"
    fi
}

# Main execution
log_info "Step 1: Creating AI Assistant Role..."
create_role_if_not_exists "SpoolAIAssistantRole" "ai-assistant-trust-policy.json"

log_info "Step 2: Attaching permissions to AI Assistant Role..."
aws iam put-role-policy \
    --role-name SpoolAIAssistantRole \
    --policy-name SpoolAIAssistantPolicy \
    --policy-document file://ai-assistant-permissions.json \
    --region "$REGION"
log_success "Attached permissions to SpoolAIAssistantRole"

log_info "Step 3: Creating Student Role..."
create_role_if_not_exists "SpoolStudentRole" "student-trust-policy.json"

log_info "Step 4: Attaching permissions to Student Role..."
aws iam put-role-policy \
    --role-name SpoolStudentRole \
    --policy-name SpoolStudentPolicy \
    --policy-document file://student-permissions.json \
    --region "$REGION"
log_success "Attached permissions to SpoolStudentRole"

log_info "Step 5: Updating ShpoolBot permissions to assume AI Assistant Role..."
aws iam put-user-policy \
    --user-name ShpoolBot \
    --policy-name AssumeAIAssistantRole \
    --policy-document file://assume-role-policy.json \
    --region "$REGION"
log_success "Updated ShpoolBot permissions"

# Clean up temporary files
log_info "Cleaning up temporary policy files..."
rm -f ai-assistant-trust-policy.json ai-assistant-permissions.json
rm -f student-trust-policy.json student-permissions.json
rm -f assume-role-policy.json

echo ""
log_success "✨ IAM Roles Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ SpoolAIAssistantRole - For AWS MCP Server tools"
echo "  ✅ SpoolStudentRole - For authenticated application users"
echo "  ✅ ShpoolBot - Updated with assume role permissions"
echo ""
echo "🔗 Role ARNs:"
echo "  AI Assistant: arn:aws:iam::${ACCOUNT_ID}:role/SpoolAIAssistantRole"
echo "  Student: arn:aws:iam::${ACCOUNT_ID}:role/SpoolStudentRole"
echo ""
echo "🔑 Next Steps:"
echo "  1. Update environment variables with role ARNs"
echo "  2. Configure application to use Student role for authenticated users"
echo "  3. Test role assumption with AI Assistant external ID"
echo "  4. Set up monitoring and cost alerts" 