import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider"
import { createHmac } from "crypto"

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
})

interface AuthResponse {
  accessToken?: string
  idToken?: string
  refreshToken?: string
  challengeName?: string
  session?: string
  error?: string
}

// Helper function to generate secret hash
function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  const message = username + clientId
  return createHmac('sha256', clientSecret).update(message).digest('base64')
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const secretHash = generateSecretHash(
      email,
      process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
      process.env.COGNITO_APP_CLIENT_SECRET!
    )

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    })

    const response = await client.send(command)

    if (response.ChallengeName) {
      return {
        challengeName: response.ChallengeName,
        session: response.Session,
      }
    }

    return {
      accessToken: response.AuthenticationResult?.AccessToken,
      idToken: response.AuthenticationResult?.IdToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return {
      error: error.message || "Authentication failed",
    }
  }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const secretHash = generateSecretHash(
      email,
      process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
      process.env.COGNITO_APP_CLIENT_SECRET!
    )

    const command = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    })

    const response = await client.send(command)

    return {
      challengeName: "EMAIL_VERIFICATION",
      session: response.UserSub,
    }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return {
      error: error.message || "Registration failed",
    }
  }
}

// Helper function to parse JWT token (client-side use only)
export function parseJwtToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Token parsing error:", error)
    return null
  }
} 