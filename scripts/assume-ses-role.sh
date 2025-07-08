#!/bin/bash

# Script to assume the SES role for operations requiring SES permissions

ROLE_ARN="arn:aws:iam::560281064968:role/SpoolSESRole"
SESSION_NAME="spool-ses-session"

echo "🔐 Assuming SES role..."

# Get temporary credentials
CREDS=$(aws sts assume-role --role-arn $ROLE_ARN --role-session-name $SESSION_NAME --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' --output text)

if [ $? -eq 0 ]; then
    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d' ' -f1)
    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d' ' -f2)
    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d' ' -f3)
    
    echo "✅ Successfully assumed role. Environment variables set."
    echo "🚀 You can now run SES operations with elevated permissions"
    echo "💡 Run 'unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN' to return to normal credentials"
else
    echo "❌ Failed to assume role"
    exit 1
fi
