"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, ChevronLeft, AlertCircle } from "lucide-react"

interface SignInPageProps {
  onSignIn: () => void
  onBack?: () => void
}

export function SignInPage({ onSignIn, onBack }: SignInPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    try {
      // Mock authentication - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation
      if (!email || !password) {
        throw new Error("Email and password are required")
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }
      
      // Set mock authentication token for auth context
      const mockUser = {
        sub: "mock-user-123",
        email: email,
        email_verified: true,
        given_name: "Mock",
        family_name: "User"
      }
      
      // Store mock user data in localStorage for auth context
      localStorage.setItem("mock-auth-user", JSON.stringify(mockUser))
      
      // Mock successful sign-in
      console.log("Mock sign-in successful for:", email)
      onSignIn()
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    try {
      // Mock sign-up - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation
      if (!email || !password) {
        throw new Error("Email and password are required")
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }
      
      if (!email.includes('@')) {
        throw new Error("Please enter a valid email address")
      }
      
      // Set mock authentication token for auth context
      const mockUser = {
        sub: "mock-user-" + Date.now(),
        email: email,
        email_verified: true,
        given_name: "Mock",
        family_name: "User"
      }
      
      // Store mock user data in localStorage for auth context
      localStorage.setItem("mock-auth-user", JSON.stringify(mockUser))
      
      // Mock successful sign-up
      console.log("Mock sign-up successful for:", email)
      setSuccessMessage("Registration successful! Please check your email to verify your account.")
      setEmail("")
      setPassword("")
      
      // Auto sign-in after successful sign-up (for better UX in mock mode)
      setTimeout(() => {
        onSignIn()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setSuccessMessage("")
    setEmail("")
    setPassword("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Back button */}
          {onBack && (
            <div className="flex justify-start mb-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="group"
              >
                <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </div>
          )}
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create a new account to get started (Mock Mode)" 
              : "Enter your email and password to access your account (Mock Mode)"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Mock Mode Notice */}
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Mock Mode:</strong> Any email/password combination will work and navigate to the dashboard (password must be 6+ chars for sign-in, 8+ for sign-up)
            </AlertDescription>
          </Alert>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                isSignUp ? "Creating Account..." : "Signing In..."
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground">
                <button 
                  className="text-primary hover:underline"
                  onClick={() => setError("Password reset functionality coming soon!")}
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              className="text-primary hover:underline"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 