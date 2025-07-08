#!/bin/bash

# Script to set up SES for password reset emails and configure Cognito

# Configuration
REGION="us-east-1"
USER_POOL_ID="us-east-1_TBQtRz0K6"
FROM_EMAIL="noreply@spool.ai"  # Change this to your domain
REPLY_TO_EMAIL="support@spool.ai"  # Change this to your support email

echo "🔧 Setting up SES for password reset emails..."

# Step 1: Verify the sender email identity
echo "1. Verifying sender email identity..."
aws ses verify-email-identity --email-address $FROM_EMAIL --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ Email identity verification initiated for $FROM_EMAIL"
    echo "📧 Please check your email and click the verification link"
else
    echo "❌ Failed to initiate email verification"
    exit 1
fi

# Step 2: Wait for user to confirm email verification
echo ""
echo "⏳ Please verify your email by clicking the link sent to $FROM_EMAIL"
read -p "Press Enter after you've verified the email..."

# Step 3: Check if email is verified
echo ""
echo "2. Checking email verification status..."
VERIFICATION_STATUS=$(aws ses get-identity-verification-attributes --identities $FROM_EMAIL --region $REGION --query "VerificationAttributes.\"$FROM_EMAIL\".VerificationStatus" --output text)

if [ "$VERIFICATION_STATUS" = "Success" ]; then
    echo "✅ Email verification successful"
else
    echo "❌ Email verification failed or pending. Status: $VERIFICATION_STATUS"
    echo "Please verify your email first and run this script again."
    exit 1
fi

# Step 4: Create SES configuration set for tracking
echo ""
echo "3. Creating SES configuration set..."
aws ses create-configuration-set --configuration-set Name=spool-password-reset --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ SES configuration set created"
else
    echo "⚠️  Configuration set might already exist or failed to create"
fi

# Step 5: Update Cognito User Pool to use SES
echo ""
echo "4. Configuring Cognito User Pool to use SES..."

# Get current user pool configuration
USER_POOL_CONFIG=$(aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID --region $REGION)

# Update user pool with SES configuration
aws cognito-idp update-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --email-configuration SourceArn=arn:aws:ses:$REGION:$(aws sts get-caller-identity --query Account --output text):identity/$FROM_EMAIL,EmailSendingAccount=DEVELOPER,From=$FROM_EMAIL,ReplyToEmailAddress=$REPLY_TO_EMAIL \
    --email-verification-message "Your Spool verification code is {####}" \
    --email-verification-subject "Spool Email Verification"

if [ $? -eq 0 ]; then
    echo "✅ Cognito User Pool updated with SES configuration"
else
    echo "❌ Failed to update Cognito User Pool"
    exit 1
fi

# Step 6: Test SES sending capability
echo ""
echo "5. Testing SES email sending..."
TEST_EMAIL="test@example.com"  # This will fail but shows if SES is working

aws ses send-email \
    --source $FROM_EMAIL \
    --destination ToAddresses=$TEST_EMAIL \
    --message Subject.Data="Test Email",Body.Text.Data="This is a test email from Spool SES setup" \
    --region $REGION \
    --output text > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ SES is configured and ready to send emails"
else
    echo "⚠️  SES test failed, but this is expected in sandbox mode"
fi

# Step 7: Display important information
echo ""
echo "📋 Setup Summary:"
echo "================================"
echo "Region: $REGION"
echo "User Pool ID: $USER_POOL_ID"
echo "From Email: $FROM_EMAIL"
echo "Reply To Email: $REPLY_TO_EMAIL"
echo ""
echo "📝 Important Notes:"
echo "• SES is in sandbox mode by default - emails can only be sent to verified addresses"
echo "• To send to any email address, request production access in AWS console"
echo "• Password reset emails will now be sent through SES"
echo "• Make sure your domain's SPF/DKIM records are configured for better deliverability"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the password reset functionality in your app"
echo "2. If you need to send to unverified emails, request SES production access"
echo "3. Consider setting up a custom domain for better email deliverability"
echo ""
echo "✅ Setup complete!" 