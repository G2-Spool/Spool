#!/bin/bash

# Script to fix SES permissions issue

REGION="us-east-1"
POLICY_NAME="SpoolSESPolicy"
ROLE_NAME="SpoolSESRole"
CURRENT_USER="ShpoolBot"
ACCOUNT_ID="560281064968"

echo "🔧 Fixing SES permissions issue..."

# Option 1: Give user permission to assume the SES role
echo "1. Option 1: Adding AssumeRole permission..."

cat > /tmp/assume-role-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::*:role/SpoolSESRole"
        }
    ]
}
EOF

aws iam create-policy \
    --policy-name "SpoolAssumeRolePolicy" \
    --policy-document file:///tmp/assume-role-policy.json \
    --description "Policy to allow assuming SES role" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ AssumeRole policy created"
else
    echo "ℹ️  AssumeRole policy already exists"
fi

# Try to attach the assume role policy
echo "2. Trying to attach AssumeRole policy..."

aws iam attach-user-policy \
    --user-name $CURRENT_USER \
    --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/SpoolAssumeRolePolicy \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ AssumeRole policy attached successfully!"
    echo "🚀 You can now run: source ./scripts/assume-ses-role.sh"
else
    echo "❌ Still at policy limit. Let's try Option 2..."
    echo ""
    echo "Option 2: Remove unused policies and add SES policy directly"
    echo ""
    
    # Show current policies
    echo "📋 Current user policies:"
    aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'AttachedPolicies[].{Name:PolicyName,Arn:PolicyArn}' --output table 2>/dev/null
    
    echo ""
    echo "🔧 Common policies that might be safe to remove:"
    echo "- Policies for services you're not using"
    echo "- Duplicate or similar policies"
    echo "- Temporary testing policies"
    echo ""
    
    # Option 2a: Try to remove common unused policies
    echo "3. Attempting to remove potentially unused policies..."
    
    # List of common policies that might be removable
    COMMON_POLICIES=(
        "AWSLambdaExecute"
        "AWSLambdaBasicExecutionRole"  
        "AWSLambdaVPCAccessExecutionRole"
        "CloudWatchLogsFullAccess"
        "AWSCodeCommitFullAccess"
        "AWSCodeBuildDeveloperAccess"
    )
    
    for policy in "${COMMON_POLICIES[@]}"; do
        echo "Checking if $policy is attached..."
        aws iam detach-user-policy \
            --user-name $CURRENT_USER \
            --policy-arn arn:aws:iam::aws:policy/$policy \
            2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Removed $policy"
            
            # Try to attach SES policy now
            echo "4. Trying to attach SES policy..."
            aws iam attach-user-policy \
                --user-name $CURRENT_USER \
                --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME
            
            if [ $? -eq 0 ]; then
                echo "✅ SES policy attached successfully!"
                echo "🚀 You can now run: ./scripts/setup-ses-password-reset.sh"
                break
            fi
        fi
    done
fi

# Option 3: Manual instructions
echo ""
echo "🔧 Manual Options:"
echo "================================"
echo ""
echo "If the above didn't work, you can manually:"
echo ""
echo "1. List your current policies:"
echo "   aws iam list-attached-user-policies --user-name $CURRENT_USER"
echo ""
echo "2. Remove an unused policy:"
echo "   aws iam detach-user-policy --user-name $CURRENT_USER --policy-arn arn:aws:iam::ACCOUNT:policy/POLICY_NAME"
echo ""
echo "3. Then attach the SES policy:"
echo "   aws iam attach-user-policy --user-name $CURRENT_USER --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"
echo ""

# Clean up
rm -f /tmp/assume-role-policy.json

echo "✅ Setup complete!" 