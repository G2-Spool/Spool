import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/services/cognito-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    if (result.challengeName) {
      return NextResponse.json({
        challengeName: result.challengeName,
        session: result.session,
      })
    }

    // Set secure HTTP-only cookies for tokens
    const response = NextResponse.json({ success: true })
    
    if (result.accessToken) {
      response.cookies.set("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
      })
    }
    
    if (result.idToken) {
      response.cookies.set("idToken", result.idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
      })
    }
    
    if (result.refreshToken) {
      response.cookies.set("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    return response
  } catch (error) {
    console.error("Sign in API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 