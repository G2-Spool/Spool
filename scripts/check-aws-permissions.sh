#!/bin/bash

# AWS Permissions Checker for Spool Application
# This script checks if your current AWS user has the required permissions

echo "🔍 Checking AWS Permissions for Spool Application..."
echo "=================================================="

# Get current user identity
echo "📋 Current AWS Identity:"
aws sts get-caller-identity --output table 2>/dev/null || {
    echo "❌ Error: Unable to get AWS identity. Check your AWS credentials."
    exit 1
}

echo ""
echo "🔧 Testing Setup Permissions..."

# Function to test permission
test_permission() {
    local service="$1"
    local action="$2"
    local description="$3"
    
    echo -n "Testing $description... "
    
    case $service in
        "cognito-idp")
            if [ "$action" = "list" ]; then
                aws cognito-idp list-user-pools --max-results 1 >/dev/null 2>&1
            fi
            ;;
        "secretsmanager")
            if [ "$action" = "list" ]; then
                aws secretsmanager list-secrets --max-results 1 >/dev/null 2>&1
            fi
            ;;
        "iam")
            if [ "$action" = "list" ]; then
                aws iam list-users --max-items 1 >/dev/null 2>&1
            fi
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "✅ PASS"
        return 0
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Test Cognito permissions
echo "🔐 Cognito Permissions:"
test_permission "cognito-idp" "list" "List User Pools"

# Test Secrets Manager permissions  
echo "🔑 Secrets Manager Permissions:"
test_permission "secretsmanager" "list" "List Secrets"

# Test IAM permissions
echo "👤 IAM Permissions:"
test_permission "iam" "list" "List Users"

echo ""
echo "📝 Permission Summary:"
echo "======================"

# Check if user pools already exist
echo "Checking existing Cognito User Pools..."
EXISTING_POOLS=$(aws cognito-idp list-user-pools --max-results 10 --output json 2>/dev/null | jq -r '.UserPools[]? | select(.Name | contains("spool")) | .Name' 2>/dev/null || echo "")

if [ -n "$EXISTING_POOLS" ]; then
    echo "✅ Found existing Spool user pools:"
    echo "$EXISTING_POOLS"
else
    echo "ℹ️  No existing Spool user pools found"
fi

# Check if secrets exist
echo "Checking existing Secrets Manager secrets..."
EXISTING_SECRETS=$(aws secretsmanager list-secrets --output json 2>/dev/null | jq -r '.SecretList[]? | select(.Name | contains("spool")) | .Name' 2>/dev/null || echo "")

if [ -n "$EXISTING_SECRETS" ]; then
    echo "✅ Found existing Spool secrets:"
    echo "$EXISTING_SECRETS"
else
    echo "ℹ️  No existing Spool secrets found"
fi

echo ""
echo "🚀 Next Steps:"
echo "=============="

if aws cognito-idp list-user-pools --max-results 1 >/dev/null 2>&1; then
    echo "✅ You have Cognito permissions - you can run the setup commands"
else
    echo "❌ Missing Cognito permissions. You need:"
    echo "   - cognito-idp:CreateUserPool"
    echo "   - cognito-idp:CreateUserPoolClient"
    echo "   - cognito-idp:ListUserPools"
fi

if aws secretsmanager list-secrets --max-results 1 >/dev/null 2>&1; then
    echo "✅ You have Secrets Manager permissions"
else
    echo "❌ Missing Secrets Manager permissions. You need:"
    echo "   - secretsmanager:CreateSecret"
    echo "   - secretsmanager:PutSecretValue"
fi

echo ""
echo "📖 For detailed permission requirements, see:"
echo "   📄 AWS-IAM-PERMISSIONS.md"
echo "   📄 AWS-SETUP-INSTRUCTIONS.md"

echo ""
echo "💡 To run the setup with current permissions:"
echo "   bash scripts/setup-aws-resources.sh" 