"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth'

export function TestPasswordReset() {
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState<'request' | 'confirm'>('request')

  const handleRequestReset = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const output = await resetPassword({ username: email })
      
      if (output.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setSuccess("Password reset code sent! Please check your email.")
        setStep('confirm')
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmReset = async () => {
    if (!resetCode || !newPassword) {
      setError("Please enter both the reset code and new password")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: resetCode,
        newPassword: newPassword,
      })
      
      setSuccess("Password reset successfully! You can now sign in with your new password.")
      setStep('request')
      setEmail("")
      setResetCode("")
      setNewPassword("")
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

  const resetForm = () => {
    setStep('request')
    setError("")
    setSuccess("")
    setResetCode("")
    setNewPassword("")
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Password Reset</CardTitle>
          <CardDescription>
            {step === 'request' 
              ? "Enter your email to request a password reset"
              : "Enter the code sent to your email and your new password"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {step === 'request' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                onClick={handleRequestReset}
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter the code from your email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
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
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleConfirmReset}
                  disabled={isLoading || !resetCode || !newPassword}
                  className="w-full"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to Request
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 