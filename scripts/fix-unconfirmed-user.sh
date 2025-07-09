#!/bin/bash

# Quick fix for the unconfirmed user

USER_POOL_ID="us-east-1_TBQtRz0K6"
USERNAME="34586448-d071-7043-9304-d749c1d1a149"

echo "🔧 Fixing unconfirmed user: rahmadiz@uci.edu"
echo "Username (UUID): $USERNAME"
echo

# Confirm the user
echo "1. Confirming user sign-up..."
aws cognito-idp admin-confirm-sign-up \
    --user-pool-id $USER_POOL_ID \
    --username "$USERNAME"

if [ $? -eq 0 ]; then
    echo "✅ User sign-up confirmed"
else
    echo "⚠️  User might already be confirmed or error occurred"
fi

# Set email as verified
echo
echo "2. Setting email_verified to true..."
aws cognito-idp admin-update-user-attributes \
    --user-pool-id $USER_POOL_ID \
    --username "$USERNAME" \
    --user-attributes Name=email_verified,Value=true

if [ $? -eq 0 ]; then
    echo "✅ Email marked as verified"
else
    echo "❌ Failed to update email verification status"
fi

# Check user status
echo
echo "3. Checking user status..."
aws cognito-idp admin-get-user \
    --user-pool-id $USER_POOL_ID \
    --username "$USERNAME" \
    --query '[UserStatus, UserAttributes[?Name==`email_verified`].Value | [0]]' \
    --output table

echo
echo "✅ User should now be able to sign in with email: rahmadiz@uci.edu" 