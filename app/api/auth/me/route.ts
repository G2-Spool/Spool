import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import { runWithAmplifyServerContext } from '@/lib/amplify-server-utils'

export async function GET(request: NextRequest) {
  try {
    // Run the auth check within Amplify server context
    const user = await runWithAmplifyServerContext({
      nextServerContext: { request },
      operation: async (contextSpec) => {
        try {
          // Get current user and session
          const currentUser = await getCurrentUser(contextSpec)
          const session = await fetchAuthSession(contextSpec)
          
          if (!session.tokens?.idToken) {
            return null
          }

          const idToken = session.tokens.idToken
          const payload = idToken.payload

          return {
            sub: currentUser.userId,
            email: payload.email as string || '',
            email_verified: payload.email_verified as boolean || false,
            given_name: payload.given_name as string || undefined,
            family_name: payload.family_name as string || undefined,
          }
        } catch (error) {
          console.error("Error getting user:", error)
          return null
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 