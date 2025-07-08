#!/bin/bash

# Script to consolidate user policies to AdministratorAccess for full AWS access

CURRENT_USER="ShpoolBot"
ACCOUNT_ID="560281064968"

echo "🔧 Consolidating user policies to AdministratorAccess..."
echo ""

# Step 1: List current policies
echo "1. Current user policies:"
echo "=========================="
aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'AttachedPolicies[].{Name:PolicyName,Arn:PolicyArn}' --output table

echo ""
echo "2. Detaching all current policies..."
echo "===================================="

# Get all attached policies and detach them
POLICIES=$(aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'AttachedPolicies[].PolicyArn' --output text)

for policy_arn in $POLICIES; do
    policy_name=$(echo $policy_arn | cut -d'/' -f2)
    echo "Detaching: $policy_name"
    
    aws iam detach-user-policy \
        --user-name $CURRENT_USER \
        --policy-arn $policy_arn
    
    if [ $? -eq 0 ]; then
        echo "✅ Detached $policy_name"
    else
        echo "❌ Failed to detach $policy_name"
    fi
done

echo ""
echo "3. Attaching AdministratorAccess policy..."
echo "=========================================="

# Attach AdministratorAccess policy
aws iam attach-user-policy \
    --user-name $CURRENT_USER \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

if [ $? -eq 0 ]; then
    echo "✅ AdministratorAccess policy attached successfully!"
else
    echo "❌ Failed to attach AdministratorAccess policy"
    exit 1
fi

echo ""
echo "4. Verification - Current policies:"
echo "=================================="
aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'AttachedPolicies[].{Name:PolicyName,Arn:PolicyArn}' --output table

echo ""
echo "5. Policy count check:"
echo "====================="
POLICY_COUNT=$(aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'length(AttachedPolicies)')
echo "Current user policies: $POLICY_COUNT/10"

echo ""
echo "📋 Summary:"
echo "==========="
echo "✅ User $CURRENT_USER now has AdministratorAccess"
echo "✅ Policy count reduced from 10 to $POLICY_COUNT"
echo "✅ Can now manage all AWS resources"
echo "✅ Available policy slots: $((10 - POLICY_COUNT))/10"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Run: ./scripts/setup-ses-password-reset.sh"
echo "2. Set up any other AWS resources as needed"
echo "3. Test the password reset functionality"

echo ""
echo "⚠️  Security Note:"
echo "AdministratorAccess provides full access to AWS services."
echo "This is appropriate for development/setup but consider"
echo "using more restrictive policies in production."

echo ""
echo "✅ Consolidation complete!" 