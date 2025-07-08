# AWS IAM Architecture for Spool Educational MVP

## Current AWS Account Analysis

**Account ID**: `560281064968`
**Current IAM User**: `ShpoolBot` (used for CI/CD and infrastructure management)

### Current ShpoolBot Permissions
✅ **Extensive Permissions** - ShpoolBot has the following AWS managed policies:
- `IAMFullAccess` - Complete IAM management
- `AmazonSSMFullAccess` - Systems Manager access
- `AmazonEC2ContainerRegistryFullAccess` - Container registry
- `AmazonEC2ReadOnlyAccess` - EC2 read access
- `CloudWatchLogsFullAccess` - Logging
- `AWSCodeBuildAdminAccess` - Build pipeline
- `AWSCodeCommitFullAccess` - Code repository
- `AmazonECS_FullAccess` - Container orchestration
- `AmplifyBackendDeployFullAccess` - Amplify deployments
- `AdministratorAccess-Amplify` - Amplify admin

## Recommended IAM Architecture

### 1. **AI Assistant Role** (for AWS MCP Server Tools)

Create a dedicated role for the AI Assistant to manage AWS resources securely:

```json
{
  "RoleName": "SpoolAIAssistantRole",
  "AssumeRolePolicyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::560281064968:user/ShpoolBot"
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
}
```

#### AI Assistant Permissions Policy:
```json
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
        "arn:aws:secretsmanager:us-east-1:560281064968:secret:spool/*"
      ]
    },
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel"
      ],
      "Resource": "*"
    },
    {
      "Sid": "BedrockKnowledgeBase",
      "Effect": "Allow",
      "Action": [
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
        "lambda:DeleteFunction",
        "lambda:CreateEventSourceMapping",
        "lambda:GetEventSourceMapping",
        "lambda:UpdateEventSourceMapping",
        "lambda:DeleteEventSourceMapping"
      ],
      "Resource": "arn:aws:lambda:us-east-1:560281064968:function:spool-*"
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
        "arn:aws:iam::560281064968:role/spool-*",
        "arn:aws:iam::560281064968:role/service-role/spool-*"
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
      "Resource": "arn:aws:logs:us-east-1:560281064968:log-group:/aws/lambda/spool-*"
    },
    {
      "Sid": "CostAndBillingRead",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetDimensionValues",
        "ce:GetReservationCoverage",
        "ce:GetReservationPurchaseRecommendation",
        "ce:GetReservationUtilization",
        "ce:GetUsageReport",
        "pricing:DescribeServices",
        "pricing:GetAttributeValues",
        "pricing:GetProducts"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. **Student User Role** (for application users)

Students should have minimal permissions - only what's needed to interact with the application:

```json
{
  "RoleName": "SpoolStudentRole",
  "AssumeRolePolicyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::560281064968:oidc-provider/cognito-idp.us-east-1.amazonaws.com/us-east-1_TBQtRz0K6"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "cognito-idp.us-east-1.amazonaws.com/us-east-1_TBQtRz0K6:aud": "2qlls9iq8b2des063h1prtoh66"
          }
        }
      }
    ]
  }
}
```

#### Student Permissions Policy:
```json
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
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    },
    {
      "Sid": "BedrockKnowledgeBaseQuery",
      "Effect": "Allow",
      "Action": [
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "arn:aws:bedrock:us-east-1:560281064968:knowledge-base/spool-*"
    },
    {
      "Sid": "S3UserContent",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::spool-user-content/${cognito-identity.amazonaws.com:sub}/*"
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
```

## Cost Analysis

### Monthly Cost Estimates (MVP Scale)

#### **Cognito Authentication**
- **Tier**: Essentials (recommended for MVP)
- **Free Tier**: 10,000 MAUs
- **Cost**: $0 for up to 10,000 students
- **Beyond Free Tier**: $0.015 per MAU

#### **AWS Secrets Manager**
- **OpenAI API Key Storage**: $0.40/month per secret
- **API Calls**: $0.05 per 10,000 calls
- **Estimated**: ~$5/month for MVP

#### **Bedrock Foundation Models** (Student Usage)
- **Claude 3 Haiku**: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- **Estimated for 1,000 students**: ~$200-500/month

#### **S3 Storage** (RAG Documents)
- **Standard Storage**: $0.023 per GB
- **Estimated**: ~$10-50/month for educational content

#### **OpenSearch Serverless** (Vector Search)
- **OCU (OpenSearch Compute Units)**: $0.24 per OCU per hour
- **Estimated**: ~$200-400/month for 2-4 OCUs

**Total Estimated Monthly Cost for MVP**: $415-955/month for 1,000 active students

## Implementation Steps

### Phase 1: Core Infrastructure Setup

1. **Create AI Assistant Role**:
```bash
aws iam create-role --role-name SpoolAIAssistantRole --assume-role-policy-document file://ai-assistant-trust-policy.json
aws iam put-role-policy --role-name SpoolAIAssistantRole --policy-name SpoolAIAssistantPolicy --policy-document file://ai-assistant-permissions.json
```

2. **Update ShpoolBot to Assume AI Assistant Role**:
```bash
aws iam put-user-policy --user-name ShpoolBot --policy-name AssumeAIAssistantRole --policy-document file://assume-role-policy.json
```

3. **Create Student Role**:
```bash
aws iam create-role --role-name SpoolStudentRole --assume-role-policy-document file://student-trust-policy.json
aws iam put-role-policy --role-name SpoolStudentRole --policy-name SpoolStudentPolicy --policy-document file://student-permissions.json
```

### Phase 2: Service Configuration

1. **Configure Cognito Identity Pool** (for student role assumption)
2. **Set up Bedrock Knowledge Base** with proper IAM roles
3. **Create S3 buckets** with appropriate bucket policies
4. **Configure OpenSearch Serverless** collections

### Phase 3: Security Hardening

1. **Enable CloudTrail** for audit logging
2. **Set up CloudWatch** alerts for unusual activity
3. **Implement resource tagging** for cost tracking
4. **Configure VPC endpoints** for private communication

## Security Best Practices

### 1. **Principle of Least Privilege**
- AI Assistant role has only necessary permissions for infrastructure management
- Student role has minimal permissions for application functionality
- Resource-level restrictions using ARN patterns

### 2. **Conditional Access**
- External ID requirement for AI Assistant role assumption
- Cognito integration for student authentication
- Regional restrictions where applicable

### 3. **Monitoring and Auditing**
- CloudTrail logging for all API calls
- CloudWatch metrics for cost monitoring
- Regular permission reviews

### 4. **Secrets Management**
- All sensitive data in AWS Secrets Manager
- No hardcoded credentials in code
- Automatic rotation where possible

## Next Steps

1. **Execute the setup scripts** in the `scripts/` directory
2. **Configure environment variables** for the AI Assistant role ARN
3. **Update application code** to use the Student role for authenticated users
4. **Set up monitoring and alerting** for cost and security
5. **Implement automated testing** for the permission boundaries

This architecture provides a secure, scalable foundation for the Spool educational MVP while maintaining clear separation of concerns between AI Assistant infrastructure management and student application usage. 