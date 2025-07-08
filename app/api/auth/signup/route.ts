import { NextRequest, NextResponse } from "next/server"
import { signUp } from "@/services/cognito-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await signUp(email, password)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Registration successful. Please check your email for verification.",
      challengeName: result.challengeName,
      session: result.session,
    })
  } catch (error) {
    console.error("Sign up API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 