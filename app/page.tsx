"use client"

import { useState, useEffect, Suspense } from "react"
import { useLocalStorageBoolean } from "@/hooks/use-local-storage"
import { MainLayout } from "@/components/templates/main-layout"
import { LandingPage } from "@/components/pages/landing-page"
import { SplashScreenPage } from "@/components/pages/splash-screen-page"
import { useAuth } from "@/contexts/auth-context"
import { SignInPage } from "@/components/pages/sign-in-page"
import { Dashboard } from "@/components/dashboard"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

function HomeContent() {
  const { user, isLoading, refreshAuth } = useAuth()
  const { navigateToUrl, navigateToLanding } = useUnifiedNavigation()
  const [, , isLoadingOnboarding] = useLocalStorageBoolean("onboarding-complete", false)
  const [hasSplashCompleted, setHasSplashCompleted, isLoadingSplash] = useLocalStorageBoolean("splash-completed", false)
  const [hasVisitedLanding, setHasVisitedLanding, isLoadingLanding] = useLocalStorageBoolean("visited-landing", false)
  const [showSplashScreen, setShowSplashScreen] = useState(false)
  const [forceShowLanding, setForceShowLanding] = useState(false)

  // Check for return-to-landing flag immediately on mount
  useEffect(() => {
    const returnToLanding = localStorage.getItem("return-to-landing")
    if (returnToLanding === "true") {
      console.log("🔧 User explicitly returned to landing page")
      localStorage.removeItem("return-to-landing")
      setForceShowLanding(true)
    }
  }, [])

  // Clear forceShowLanding when user is authenticated
  useEffect(() => {
    if (user && forceShowLanding) {
      console.log("🔧 User authenticated, clearing force landing flag")
      setForceShowLanding(false)
    }
  }, [user, forceShowLanding])

  const handleGetStarted = () => {
    setHasVisitedLanding(true)
    setForceShowLanding(false)
    // Don't navigate to dashboard here - just let the app show sign-in page
    // Navigation to dashboard will happen after successful sign-in
  }

  const handleSplashComplete = () => {
    setHasSplashCompleted(true)
    setShowSplashScreen(false)
    // Navigate to dashboard after splash screen
    navigateToUrl("/?tab=dashboard")
  }

  // Check if user wants to see splash screen (from sign out)
  useEffect(() => {
    const shouldShowSplash = localStorage.getItem("show-splash-screen")
    if (shouldShowSplash === "true") {
      setShowSplashScreen(true)
      localStorage.removeItem("show-splash-screen")
    }
  }, [])

  // Show loading state only for localStorage operations, not auth
  if (isLoadingOnboarding || isLoadingSplash || isLoadingLanding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading preferences...</div>
      </div>
    )
  }

  // Show auth loading only for initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  // Show landing page if user hasn't visited yet or if forced
  if (!hasVisitedLanding || forceShowLanding) {
    return (
      <div className="min-h-screen bg-background">
        <LandingPage onGetStarted={handleGetStarted} />
      </div>
    )
  }

  // Show splash screen if requested (from sign out) or after sign in
  if (showSplashScreen || (user && !hasSplashCompleted)) {
    return (
      <div className="min-h-screen bg-background">
        <SplashScreenPage onComplete={handleSplashComplete} />
      </div>
    )
  }

  // Check if user is signed in
  if (!user) {
    const handleBackToLanding = () => {
      // Immediately update local state to show landing page
      setHasVisitedLanding(false)
      setForceShowLanding(true)
      
      // Also call navigateToLanding to update URL and localStorage
      navigateToLanding()
    }

    return (
      <div className="min-h-screen bg-background">
        <SignInPage 
          onSignIn={async () => {
            // Clear force landing flag and let normal flow handle routing
            setForceShowLanding(false)
            // Refresh auth context to get the new user
            await refreshAuth()
            // Navigate to dashboard after sign in
            navigateToUrl("/?tab=dashboard")
          }} 
          onBack={handleBackToLanding}
        />
      </div>
    )
  }

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
