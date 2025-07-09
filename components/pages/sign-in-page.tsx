"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EyeIcon, EyeOffIcon, ChevronLeft, AlertCircle } from "lucide-react"
import { signIn, signUp, resetPassword, confirmResetPassword, confirmSignUp, type SignInInput, type SignUpInput } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'

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
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false)

  // Check if Amplify is configured
  useEffect(() => {
    // Import the config to trigger initialization
    import('@/lib/amplify-config').then(() => {
      // Give it a moment to configure
      setTimeout(() => {
        try {
          // Check if Amplify has been configured by checking if we can access the config
          const config = Amplify.getConfig()
          if (config && config.Auth) {
            setIsAmplifyConfigured(true)
            console.log('✅ Amplify is configured and ready')
          } else {
            console.error('❌ Amplify configuration not found')
            setError('Authentication service is not configured. Please check your environment variables.')
          }
        } catch (err) {
          console.error('❌ Failed to check Amplify configuration:', err)
          setError('Authentication service is not configured. Please check your environment variables.')
        }
      }, 100)
    })
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    if (!isAmplifyConfigured) {
      setError("Authentication service is not configured. Please check your environment setup.")
      setIsLoading(false)
      return
    }
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required")
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }
      
      // Sign in with Cognito
      const signInInput: SignInInput = {
        username: email,
        password: password,
      }
      
      const { isSignedIn, nextStep } = await signIn(signInInput)
      
      if (isSignedIn) {
        console.log("Sign-in successful")
        // Trigger auth context refresh and then call onSignIn
        setTimeout(() => {
          onSignIn()
        }, 100)
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // User needs confirmation
        setError("Your account needs to be confirmed. Please contact support to activate your account.")
      } else {
        // Handle additional steps if needed (MFA, etc.)
        setError(`Additional step required: ${nextStep.signInStep}`)
      }
    } catch (err: any) {
      console.error("Sign-in error:", err)
      if (err.name === 'NotAuthorizedException') {
        setError("Incorrect email or password")
      } else if (err.name === 'UserNotFoundException') {
        setError("No account found with this email")
      } else {
        setError(err.message || "Authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    if (!isAmplifyConfigured) {
      setError("Authentication service is not configured. Please check your environment setup.")
      setIsLoading(false)
      return
    }
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required")
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters")
      }
      
      if (!email.includes('@')) {
        throw new Error("Please enter a valid email address")
      }
      
      // Sign up with Cognito
      const signUpInput: SignUpInput = {
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
          autoSignIn: true, // Enable auto sign-in after sign-up
        },
      }
      
      const { isSignUpComplete, userId, nextStep } = await signUp(signUpInput)
      
      console.log("Sign-up successful, user ID:", userId)
      console.log("Sign-up complete:", isSignUpComplete)
      console.log("Next step:", nextStep)
      
      // Check if user needs confirmation
      if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // User needs confirmation - try to auto-confirm
        setSuccessMessage("Account created! Attempting to activate your account...")
        
        // Try to confirm the user (this might fail if we don't have the right permissions)
        try {
          await confirmSignUp({
            username: email,
            confirmationCode: '123456' // This won't work, but we try anyway
          })
        } catch (confirmErr) {
          console.log("Auto-confirm failed (expected):", confirmErr)
        }
        
        // Now try to sign in - it might work if the admin has confirmed the user
        setTimeout(async () => {
          try {
            const signInInput: SignInInput = {
              username: email,
              password: password,
            }
            
            const { isSignedIn } = await signIn(signInInput)
            
            if (isSignedIn) {
              console.log("Sign-in successful after sign-up")
              setTimeout(() => {
                onSignIn()
              }, 100)
            } else {
              // Sign-in didn't work, user needs manual confirmation
              setError("Account created but needs activation. Please contact support or try signing in again in a few minutes.")
              setSuccessMessage("")
              setIsSignUp(false) // Switch to sign-in mode
            }
          } catch (signInErr: any) {
            console.error("Auto sign-in error:", signInErr)
            if (signInErr.message?.includes('not confirmed')) {
              setError("Account created but needs activation. Please contact support or try signing in again in a few minutes.")
            } else {
              setError("Account created! Please try signing in.")
            }
            setSuccessMessage("")
            setIsSignUp(false) // Switch to sign-in mode
          }
        }, 1000)
      } else {
        // Sign-up is complete, try to sign in
        setSuccessMessage("Account created! Signing you in...")
        
        setTimeout(async () => {
          try {
            const signInInput: SignInInput = {
              username: email,
              password: password,
            }
            
            const { isSignedIn } = await signIn(signInInput)
            
            if (isSignedIn) {
              console.log("Auto sign-in successful")
              setTimeout(() => {
                onSignIn()
              }, 100)
            } else {
              // If auto sign-in didn't work, switch to sign-in mode
              setSuccessMessage("Account created! Please sign in.")
              setIsSignUp(false)
            }
          } catch (signInErr: any) {
            console.error("Auto sign-in error:", signInErr)
            setError("Account created! Please sign in manually.")
            setSuccessMessage("")
            setIsSignUp(false)
          }
        }, 500)
      }
      
    } catch (err: any) {
      console.error("Sign-up error:", err)
      if (err.name === 'UsernameExistsException') {
        setError("An account with this email already exists")
      } else {
        setError(err.message || "Registration failed. Please try again.")
      }
    } finally {
      // Make sure to reset loading state after a timeout if nothing else does
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      const output = await resetPassword({ username: email })
      
      if (output.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setIsResetPassword(true)
        setSuccessMessage("Password reset code sent! Please check your email.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: resetCode,
        newPassword: newPassword,
      })
      
      setSuccessMessage("Password reset successfully! You can now sign in with your new password.")
      setIsResetPassword(false)
      setResetCode("")
      setNewPassword("")
      setPassword("")
    } catch (err: any) {
      if (err.name === 'CodeMismatchException') {
        setError("Invalid reset code. Please try again.")
      } else {
        setError(err.message || "Password reset failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleMockAuth = async () => {
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Set mock authentication flags and user data
      const mockUser = {
        sub: "mock-user-123",
        email: "mock@example.com",
        email_verified: true,
        given_name: "Mock",
        family_name: "User"
      }
      
      localStorage.setItem("mock-auth-enabled", "true")
      localStorage.setItem("mock-user-data", JSON.stringify(mockUser))
      
      // Clear splash completion flag to force splash screen
      localStorage.removeItem("splash-completed")
      // Also clear onboarding completion to ensure full onboarding flow
      localStorage.removeItem("onboarding-complete")
      
      setSuccessMessage("Mock authentication successful! Redirecting to splash screen...")
      
      // Call onSignIn to trigger auth context refresh
      setTimeout(() => {
        onSignIn()
      }, 500)
      
    } catch (err: any) {
      setError("Mock authentication failed. Please try again.")
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
    setIsResetPassword(false)
  }

  // Render password reset form
  if (isResetPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter the code sent to {email} and your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter your reset code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !resetCode || !newPassword}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <button 
                className="text-primary hover:underline"
                onClick={() => setIsResetPassword(false)}
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              ? "Create a new account to get started" 
              : "Enter your email and password to access your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {error.includes('environment') && (
                  <div className="mt-2 text-xs">
                    <p>Please ensure:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>You have a .env.local file with Cognito configuration</li>
                      <li>You have restarted the dev server after creating .env.local</li>
                      <li>The file contains NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_APP_CLIENT_ID</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

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
                  onClick={handleForgotPassword}
                  disabled={isLoading}
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