"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLocalStorageBoolean } from "@/hooks/use-local-storage"
import { MainLayout } from "@/components/templates/main-layout"
import { LandingPage } from "@/components/pages/landing-page"
import { SplashScreenPage } from "@/components/pages/splash-screen-page"
import { useAuth } from "@/contexts/auth-context"
import { SignInPage } from "@/components/pages/sign-in-page"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [isOnboarded, setIsOnboarded, isLoadingOnboarding] = useLocalStorageBoolean("onboarding-complete", false)
  const [hasSplashCompleted, setHasSplashCompleted, isLoadingSplash] = useLocalStorageBoolean("splash-completed", false)
  const [hasVisitedLanding, setHasVisitedLanding, isLoadingLanding] = useLocalStorageBoolean("visited-landing", false)
  const [showSplashScreen, setShowSplashScreen] = useState(false)
  const [activeTab, setActiveTab] = useState("learning")
  const searchParams = useSearchParams()

  const handleGetStarted = () => {
    setHasVisitedLanding(true)
  }

  const handleOnboardingComplete = () => {
    setIsOnboarded(true)
  }

  const handleSplashComplete = () => {
    setHasSplashCompleted(true)
    setShowSplashScreen(false)
  }

  // Check for URL parameters to set the active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["learning", "dashboard", "classes", "visualization", "settings", "profile"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Check if user wants to see splash screen (from sign out)
  useEffect(() => {
    const shouldShowSplash = localStorage.getItem("show-splash-screen")
    if (shouldShowSplash === "true") {
      setShowSplashScreen(true)
      localStorage.removeItem("show-splash-screen")
    }
  }, [])

  // Show loading state while checking auth and localStorage
  if (isLoading || isLoadingOnboarding || isLoadingSplash || isLoadingLanding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Show landing page if user hasn't visited yet
  if (!hasVisitedLanding) {
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
    return (
      <div className="min-h-screen bg-background">
        <SignInPage onSignIn={() => window.location.reload()} />
      </div>
    )
  }

  return <Dashboard />
}
