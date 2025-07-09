#!/bin/bash

# Add missing Cognito permissions for ShpoolBot user

echo "Adding missing Cognito permissions for ShpoolBot user..."

# Create inline policy for additional Cognito permissions
cat > cognito-additional-permissions.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:UpdateUserPoolClient",
                "cognito-idp:AdminConfirmSignUp",
                "cognito-idp:AdminUpdateUserAttributes",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminDeleteUser",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminListGroupsForUser",
                "cognito-idp:AdminAddUserToGroup",
                "cognito-idp:AdminRemoveUserFromGroup",
                "cognito-idp:AdminSetUserMFAPreference",
                "cognito-idp:AdminResetUserPassword",
                "cognito-idp:AdminRespondToAuthChallenge",
                "cognito-idp:ListUsers",
                "cognito-idp:UpdateUserPool",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:DescribeUserPoolClient"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Attach the policy to ShpoolBot user
aws iam put-user-policy \
    --user-name ShpoolBot \
    --policy-name CognitoAdditionalPermissions \
    --policy-document file://cognito-additional-permissions.json

if [ $? -eq 0 ]; then
    echo "✅ Successfully added Cognito permissions to ShpoolBot user"
else
    echo "❌ Failed to add Cognito permissions"
fi

# Clean up
rm -f cognito-additional-permissions.json

echo "You can now run the Cognito update commands" 