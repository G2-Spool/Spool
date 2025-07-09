#!/bin/bash

# Investigate why users don't exist in Cognito User Pool

USER_POOL_ID="us-east-1_TBQtRz0K6"

echo "🔍 Investigating user existence issue in Cognito User Pool..."
echo "User Pool ID: $USER_POOL_ID"
echo

# 1. List all users to see what's actually in the pool
echo "1. Checking all users in the pool:"
aws cognito-idp list-users --user-pool-id $USER_POOL_ID --max-items 20

echo
echo "2. Checking User Pool configuration:"
aws cognito-idp describe-user-pool --user-pool-id $USER_POOL_ID | jq '.UserPool.Policies, .UserPool.AutoVerifiedAttributes, .UserPool.AliasAttributes, .UserPool.UsernameAttributes'

echo
echo "3. Checking User Pool Client configuration:"
aws cognito-idp describe-user-pool-client --user-pool-id $USER_POOL_ID --client-id 2bdesb5u92d8irnqjvprn8aooo | jq '.UserPoolClient.ExplicitAuthFlows, .UserPoolClient.PreventUserExistenceErrors'

echo
echo "4. Common reasons for 'User does not exist' error:"
echo "   - User never completed sign-up (started but didn't finish)"
echo "   - User was created but expired due to unconfirmed status"
echo "   - Username/email format doesn't match what's stored in Cognito"
echo "   - User was deleted or never existed"
echo

echo "💡 If users are missing, they likely:"
echo "   1. Started sign-up but didn't complete it"
echo "   2. Were auto-deleted due to being unconfirmed for too long"
echo "   3. Are using email as username but stored differently in Cognito" 