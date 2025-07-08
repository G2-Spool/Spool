import { NextRequest, NextResponse } from "next/server"
import { parseJwtToken } from "@/services/cognito-auth"

export async function GET(request: NextRequest) {
  try {
    const idToken = request.cookies.get("idToken")?.value

    if (!idToken) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const payload = parseJwtToken(idToken)
    
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      given_name: payload.given_name,
      family_name: payload.family_name,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 