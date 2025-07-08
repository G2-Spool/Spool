"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { EyeIcon, EyeOffIcon, ChevronLeft } from "lucide-react"

interface SignInPageProps {
  onSignIn: () => void
  onBack?: () => void
}

export function SignInPage({ onSignIn, onBack }: SignInPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    onSignIn()
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
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
            <div className="text-center text-sm text-muted-foreground">
              <button className="text-primary hover:underline">
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button className="text-primary hover:underline">
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 