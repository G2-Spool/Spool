import { NextRequest, NextResponse } from "next/server"
import { API_ENDPOINTS } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward request to auth service
    const response = await fetch(API_ENDPOINTS.AUTH.SIGNIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Authentication failed" },
        { status: response.status }
      )
    }

    // Handle successful authentication
    if (data.success && data.tokens) {
      // Set secure HTTP-only cookies for tokens
      const nextResponse = NextResponse.json({ success: true })
      
      if (data.tokens.accessToken) {
        nextResponse.cookies.set("accessToken", data.tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60, // 1 hour
        })
      }
      
      if (data.tokens.idToken) {
        nextResponse.cookies.set("idToken", data.tokens.idToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60, // 1 hour
        })
      }
      
      if (data.tokens.refreshToken) {
        nextResponse.cookies.set("refreshToken", data.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        })
      }

      return nextResponse
    }

    // Handle challenges (e.g., new password required)
    if (data.challengeName) {
      return NextResponse.json({
        challengeName: data.challengeName,
        session: data.session,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 