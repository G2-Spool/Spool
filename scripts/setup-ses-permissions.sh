#!/bin/bash

# Script to set up IAM permissions for SES operations

# Configuration
REGION="us-east-1"
POLICY_NAME="SpoolSESPolicy"
ROLE_NAME="SpoolSESRole"

echo "🔧 Setting up IAM permissions for SES operations..."

# Get current user and account info
CURRENT_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create or update IAM policy for SES operations
echo "1. Creating/updating IAM policy for SES operations..."

cat > /tmp/ses-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:SendBulkTemplatedEmail",
                "ses:SendTemplatedEmail",
                "ses:VerifyEmailIdentity",
                "ses:VerifyDomainIdentity",
                "ses:GetIdentityVerificationAttributes",
                "ses:GetIdentityDkimAttributes",
                "ses:GetIdentityPolicies",
                "ses:ListIdentities",
                "ses:ListVerifiedEmailAddresses",
                "ses:GetSendQuota",
                "ses:GetSendStatistics",
                "ses:CreateConfigurationSet",
                "ses:DeleteConfigurationSet",
                "ses:DescribeConfigurationSet",
                "ses:ListConfigurationSets"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:UpdateUserPool",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:AdminRespondToAuthChallenge",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminDeleteUser",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminUpdateUserAttributes"
            ],
            "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
        }
    ]
}
EOF

aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/ses-policy.json \
    --description "Policy for Spool SES operations" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ IAM policy created successfully"
else
    echo "ℹ️  Policy $POLICY_NAME already exists, continuing..."
fi

# Step 2: Check current user policy count
echo ""
echo "2. Checking user policy limits..."

POLICY_COUNT=$(aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'length(AttachedPolicies)')
echo "Current user policies: $POLICY_COUNT/10"

if [ $POLICY_COUNT -ge 10 ]; then
    echo "⚠️  User has reached the 10 policy limit. Showing current policies:"
    echo ""
    aws iam list-attached-user-policies --user-name $CURRENT_USER --query 'AttachedPolicies[].PolicyName' --output table
    echo ""
    echo "🔧 Solutions:"
    echo "1. The IAM role SpoolSESRole has been created with the necessary permissions"
    echo "2. Your applications can assume this role instead of using direct user permissions"
    echo "3. Or you can detach unused policies from your user"
    echo ""
    echo "To detach a policy, run:"
    echo "aws iam detach-user-policy --user-name $CURRENT_USER --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/PolicyNameToRemove"
else
    echo "3. Attaching policy to current user..."
    aws iam attach-user-policy \
        --user-name $CURRENT_USER \
        --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME

    if [ $? -eq 0 ]; then
        echo "✅ Policy attached to user $CURRENT_USER"
    else
        echo "❌ Failed to attach policy to user"
    fi
fi

# Step 3: Create IAM role for Cognito to access SES
echo ""
echo "4. Creating/updating IAM role for Cognito SES access..."

cat > /tmp/trust-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "cognito-idp.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Role for Cognito to access SES" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ IAM role created successfully"
else
    echo "ℹ️  Role $ROLE_NAME already exists, continuing..."
fi

# Step 4: Attach SES policy to role
echo ""
echo "5. Attaching SES policy to role..."

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME

if [ $? -eq 0 ]; then
    echo "✅ Policy attached to role $ROLE_NAME"
else
    echo "ℹ️  Policy already attached to role $ROLE_NAME"
fi

# Step 5: Create alternative script for using role-based permissions
echo ""
echo "6. Creating role-based permission script..."

cat > "scripts/assume-ses-role.sh" << EOF
#!/bin/bash

# Script to assume the SES role for operations requiring SES permissions

ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"
SESSION_NAME="spool-ses-session"

echo "🔐 Assuming SES role..."

# Get temporary credentials
CREDS=\$(aws sts assume-role --role-arn \$ROLE_ARN --role-session-name \$SESSION_NAME --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' --output text)

if [ \$? -eq 0 ]; then
    export AWS_ACCESS_KEY_ID=\$(echo \$CREDS | cut -d' ' -f1)
    export AWS_SECRET_ACCESS_KEY=\$(echo \$CREDS | cut -d' ' -f2)
    export AWS_SESSION_TOKEN=\$(echo \$CREDS | cut -d' ' -f3)
    
    echo "✅ Successfully assumed role. Environment variables set."
    echo "🚀 You can now run SES operations with elevated permissions"
    echo "💡 Run 'unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN' to return to normal credentials"
else
    echo "❌ Failed to assume role"
    exit 1
fi
EOF

chmod +x "scripts/assume-ses-role.sh"
echo "✅ Role assumption script created at scripts/assume-ses-role.sh"

# Step 6: Clean up temporary files
rm -f /tmp/ses-policy.json /tmp/trust-policy.json

echo ""
echo "📋 Setup Summary:"
echo "================================"
echo "Policy Name: $POLICY_NAME"
echo "Role Name: $ROLE_NAME"
echo "Current User: $CURRENT_USER"
echo "Account ID: $ACCOUNT_ID"
echo "User Policy Count: $POLICY_COUNT/10"
echo ""

if [ $POLICY_COUNT -ge 10 ]; then
    echo "⚠️  IMPORTANT: User policy limit reached!"
    echo ""
    echo "🔧 To use SES operations, you have two options:"
    echo ""
    echo "Option 1: Use role-based permissions (Recommended)"
    echo "  source ./scripts/assume-ses-role.sh"
    echo "  ./scripts/setup-ses-password-reset.sh"
    echo ""
    echo "Option 2: Remove unused policies from your user"
    echo "  aws iam detach-user-policy --user-name $CURRENT_USER --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/POLICY_NAME"
    echo ""
else
    echo "✅ Direct user permissions configured successfully!"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. If you hit policy limits, run: source ./scripts/assume-ses-role.sh"
echo "2. Then run: ./scripts/setup-ses-password-reset.sh"
echo "3. Test the password reset functionality"
echo "" 