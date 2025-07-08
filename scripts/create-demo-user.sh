#!/bin/bash

# Script to create a demo user account in AWS Cognito

# Configuration
USER_POOL_ID="us-east-1_TBQtRz0K6"
USERNAME="demo@spool.ai"
TEMP_PASSWORD="TempPassword123!"
PERMANENT_PASSWORD="DemoUser123!"

echo "🔧 Creating demo user account..."

# Create the user with temporary password
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --user-attributes Name=email,Value=$USERNAME Name=email_verified,Value=true \
  --temporary-password $TEMP_PASSWORD \
  --message-action SUPPRESS

if [ $? -eq 0 ]; then
  echo "✅ Demo user created successfully"
  
  # Set permanent password
  echo "🔧 Setting permanent password..."
  aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username $USERNAME \
    --password $PERMANENT_PASSWORD \
    --permanent
  
  if [ $? -eq 0 ]; then
    echo "✅ Demo user password set successfully"
    echo ""
    echo "Demo User Credentials:"
    echo "  Email: $USERNAME"
    echo "  Password: $PERMANENT_PASSWORD"
    echo ""
    echo "You can now use the 'Development Mode' button on the landing page to quickly sign in with this demo account."
  else
    echo "❌ Failed to set permanent password"
  fi
else
  echo "❌ Failed to create demo user"
  echo "Note: If the user already exists, you can delete it first with:"
  echo "aws cognito-idp admin-delete-user --user-pool-id $USER_POOL_ID --username $USERNAME"
fi 