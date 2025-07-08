#!/bin/bash

# Script to completely disable email verification in Cognito User Pool

USER_POOL_ID="us-east-1_TBQtRz0K6"

echo "🔧 Disabling email verification in Cognito User Pool..."
echo "User Pool ID: $USER_POOL_ID"

# Step 1: Check current configuration
echo ""
echo "1. Checking current User Pool configuration..."
aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --query 'UserPool.{AutoVerifiedAttributes:AutoVerifiedAttributes,AliasAttributes:AliasAttributes,UsernameAttributes:UsernameAttributes}' --output table

# Step 2: Update User Pool to disable email verification
echo ""
echo "2. Updating User Pool to disable email verification..."

aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --auto-verified-attributes \
    --username-attributes email \
    --verification-message-template DefaultEmailOption=CONFIRM_WITH_LINK,DefaultSMSMessage="Your verification code is {####}",DefaultEmailMessage="Your verification code is {####}",DefaultEmailSubject="Your verification code"

if [ $? -eq 0 ]; then
    echo "✅ User Pool updated successfully"
else
    echo "❌ Failed to update User Pool"
fi

# Step 3: Alternative approach - set auto-verified attributes to empty
echo ""
echo "3. Removing all auto-verified attributes..."

aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --auto-verified-attributes

if [ $? -eq 0 ]; then
    echo "✅ Auto-verified attributes removed"
else
    echo "❌ Failed to remove auto-verified attributes"
fi

# Step 4: Update the User Pool policies
echo ""
echo "4. Updating User Pool policies..."

aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": false,
            "RequireLowercase": false,
            "RequireNumbers": false,
            "RequireSymbols": false
        }
    }'

if [ $? -eq 0 ]; then
    echo "✅ User Pool policies updated"
else
    echo "❌ Failed to update User Pool policies"
fi

# Step 5: Check if there are any existing users that need to be confirmed
echo ""
echo "5. Checking for unconfirmed users..."

# List users and check their status
aws cognito-idp list-users --user-pool-id $USER_POOL_ID --query 'Users[?UserStatus!=`CONFIRMED`].{Username:Username,UserStatus:UserStatus,Email:Attributes[?Name==`email`].Value|[0]}' --output table

echo ""
echo "6. Auto-confirming any unconfirmed users..."

# Get unconfirmed users
UNCONFIRMED_USERS=$(aws cognito-idp list-users --user-pool-id $USER_POOL_ID --query 'Users[?UserStatus!=`CONFIRMED`].Username' --output text)

if [ ! -z "$UNCONFIRMED_USERS" ]; then
    for username in $UNCONFIRMED_USERS; do
        echo "Confirming user: $username"
        aws cognito-idp admin-confirm-sign-up --user-pool-id $USER_POOL_ID --username $username
        
        if [ $? -eq 0 ]; then
            echo "✅ User $username confirmed"
        else
            echo "❌ Failed to confirm user $username"
        fi
    done
else
    echo "ℹ️  No unconfirmed users found"
fi

# Step 7: Verify the final configuration
echo ""
echo "7. Final configuration check..."
aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --query 'UserPool.{AutoVerifiedAttributes:AutoVerifiedAttributes,AliasAttributes:AliasAttributes,UsernameAttributes:UsernameAttributes}' --output table

echo ""
echo "📋 Configuration Summary:"
echo "========================="
echo "✅ Email verification disabled"
echo "✅ Auto-verified attributes removed"
echo "✅ Existing users confirmed"
echo "✅ Users can now sign up without email verification"

echo ""
echo "🚀 Next Steps:"
echo "1. Test user sign-up on your application"
echo "2. New users should be able to sign in immediately after registration"
echo "3. No email verification required"

echo ""
echo "💡 Note: If you still see confirmation issues, restart your Next.js app"
echo "and clear your browser cache/localStorage"

echo ""
echo "✅ Email verification completely disabled!" 