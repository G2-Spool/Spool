'use client'

import { Amplify } from 'aws-amplify'

// Only configure Amplify on the client side
if (typeof window !== 'undefined') {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'

  if (!userPoolId || !userPoolClientId) {
    console.error('❌ Missing required Cognito configuration:')
    console.error('NEXT_PUBLIC_COGNITO_USER_POOL_ID:', userPoolId)
    console.error('NEXT_PUBLIC_COGNITO_APP_CLIENT_ID:', userPoolClientId)
    console.error('Please check your .env.local file')
  } else {
    const amplifyConfig = {
      Auth: {
        Cognito: {
          userPoolId: userPoolId,
          userPoolClientId: userPoolClientId,
          signUpVerificationMethod: 'code' as const,
          loginWith: {
            email: true,
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: false,
          },
        },
      },
    }

    try {
      Amplify.configure(amplifyConfig)
      console.log('✅ Amplify configured successfully')
      console.log('User Pool ID:', userPoolId)
      console.log('Client ID:', userPoolClientId)
      console.log('Region:', region)
    } catch (error) {
      console.error('❌ Failed to configure Amplify:', error)
    }
  }
}

export { } 