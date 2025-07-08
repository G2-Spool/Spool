#!/bin/bash

# Fix Amplify IAM Permissions for SSM Access
# This script checks and fixes the IAM permissions for Amplify to access SSM Parameter Store

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
AWS_REGION="us-east-1"
AMPLIFY_APP_ID="d1zp9qcvdet6wr"

print_status "Checking Amplify IAM permissions for SSM access..."

# Get Amplify app details
print_status "Getting Amplify app details..."
AMPLIFY_APP_DETAILS=$(aws amplify get-app --app-id ${AMPLIFY_APP_ID} --region ${AWS_REGION})
SERVICE_ROLE_ARN=$(echo "${AMPLIFY_APP_DETAILS}" | jq -r '.app.serviceRole // empty')

if [ -z "${SERVICE_ROLE_ARN}" ] || [ "${SERVICE_ROLE_ARN}" = "null" ]; then
    print_error "No service role found for Amplify app. Creating one..."
    
    # Create service role
    ROLE_NAME="amplify-${AMPLIFY_APP_ID}-service-role"
    
    # Create trust policy
    cat > /tmp/amplify-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "amplify.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create the role
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file:///tmp/amplify-trust-policy.json \
        --description "Service role for Amplify app ${AMPLIFY_APP_ID}" || {
        print_error "Failed to create service role"
        exit 1
    }
    
    SERVICE_ROLE_ARN="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${ROLE_NAME}"
    print_success "Created service role: ${SERVICE_ROLE_ARN}"
    
    # Update Amplify app to use the service role
    aws amplify update-app \
        --app-id ${AMPLIFY_APP_ID} \
        --service-role ${SERVICE_ROLE_ARN} \
        --region ${AWS_REGION} || {
        print_error "Failed to update Amplify app with service role"
        exit 1
    }
    
    print_success "Updated Amplify app with service role"
else
    print_success "Found existing service role: ${SERVICE_ROLE_ARN}"
fi

# Extract role name from ARN
ROLE_NAME=$(echo "${SERVICE_ROLE_ARN}" | awk -F'/' '{print $NF}')

print_status "Checking current IAM policies for role: ${ROLE_NAME}"

# Check if SSM policy already exists
POLICY_NAME="AmplifySSMParameterAccess"
POLICY_ARN="arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/${POLICY_NAME}"

# Check if policy exists
if aws iam get-policy --policy-arn "${POLICY_ARN}" > /dev/null 2>&1; then
    print_success "SSM policy already exists: ${POLICY_ARN}"
else
    print_status "Creating SSM access policy..."
    
    # Create SSM policy
    cat > /tmp/amplify-ssm-policy.json << EOF
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
      "Resource": [
        "arn:aws:ssm:*:*:parameter/amplify/${AMPLIFY_APP_ID}/*"
      ]
    }
  ]
}
EOF

    aws iam create-policy \
        --policy-name "${POLICY_NAME}" \
        --policy-document file:///tmp/amplify-ssm-policy.json \
        --description "Allows Amplify to access SSM parameters" || {
        print_error "Failed to create SSM policy"
        exit 1
    }
    
    print_success "Created SSM policy: ${POLICY_ARN}"
fi

# Check if policy is attached to role
print_status "Checking if SSM policy is attached to role..."
if aws iam list-attached-role-policies --role-name "${ROLE_NAME}" | grep -q "${POLICY_NAME}"; then
    print_success "SSM policy is already attached to role"
else
    print_status "Attaching SSM policy to role..."
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "${POLICY_ARN}" || {
        print_error "Failed to attach SSM policy to role"
        exit 1
    }
    
    print_success "Attached SSM policy to role"
fi

# Also ensure basic Amplify permissions
print_status "Checking basic Amplify permissions..."
if aws iam list-attached-role-policies --role-name "${ROLE_NAME}" | grep -q "service-role/AmplifyBackendDeployFullAccess"; then
    print_success "Basic Amplify permissions already attached"
else
    print_status "Attaching basic Amplify permissions..."
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess" || {
        print_warning "Failed to attach basic Amplify permissions (may not be critical)"
    }
fi

# List all policies attached to the role
print_status "Current policies attached to role ${ROLE_NAME}:"
aws iam list-attached-role-policies --role-name "${ROLE_NAME}" --query "AttachedPolicies[].PolicyName" --output table

print_success "IAM permissions setup complete!"
print_warning "Next steps:"
echo "1. Run ./setup-amplify-secrets.sh to create SSM parameters"
echo "2. Trigger a new build in Amplify console"
echo "3. Check build logs for successful secret loading"

# Clean up temp files
rm -f /tmp/amplify-trust-policy.json /tmp/amplify-ssm-policy.json 