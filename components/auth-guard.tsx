"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SignInPage } from "@/components/pages/sign-in-page"

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = "/" }: AuthGuardProps) {
  const { user, isLoading, refreshAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is not authenticated and not loading, redirect to sign in
    if (!user && !isLoading) {
      // Store the intended destination
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        localStorage.setItem('auth-redirect', window.location.pathname)
      }
    }
  }, [user, isLoading])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  // If not authenticated, show sign in page
  if (!user) {
    const handleBackToLanding = () => {
      localStorage.setItem("return-to-landing", "true")
      localStorage.removeItem("visited-landing")
      router.push("/")
    }

    const handleSignIn = async () => {
      await refreshAuth()
      
      // Check for redirect URL
      const redirectUrl = localStorage.getItem('auth-redirect')
      if (redirectUrl && redirectUrl !== '/') {
        localStorage.removeItem('auth-redirect')
        router.push(redirectUrl)
      } else {
        router.push(redirectTo)
      }
    }

    return (
      <div className="min-h-screen bg-background">
        <SignInPage 
          onSignIn={handleSignIn}
          onBack={handleBackToLanding}
        />
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
} 