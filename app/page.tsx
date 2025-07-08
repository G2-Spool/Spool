"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLocalStorageBoolean } from "@/hooks/use-local-storage"
import { MainLayout } from "@/components/templates/main-layout"
import { LandingPage } from "@/components/pages/landing-page"
import { SplashScreenPage } from "@/components/pages/splash-screen-page"
import { SignInPage } from "@/components/pages/sign-in-page"
import { OnboardingPage } from "@/components/pages/onboarding-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { DailyLearningPage } from "@/components/pages/daily-learning-page"
import { ProgressPage } from "@/components/pages/progress-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { ClassesPage } from "@/components/pages/classes-page"

export default function App() {
  const [isSignedIn, setIsSignedIn, isLoadingSignIn] = useLocalStorageBoolean("user-signed-in", false)
  const [isOnboarded, setIsOnboarded, isLoadingOnboarding] = useLocalStorageBoolean("onboarding-complete", false)
  const [hasSplashCompleted, setHasSplashCompleted, isLoadingSplash] = useLocalStorageBoolean("splash-completed", false)
  const [hasVisitedLanding, setHasVisitedLanding, isLoadingLanding] = useLocalStorageBoolean("visited-landing", false)
  const [showSplashScreen, setShowSplashScreen] = useState(false)
  const [activeTab, setActiveTab] = useState("learning")
  const searchParams = useSearchParams()

  const handleGetStarted = () => {
    setHasVisitedLanding(true)
  }

  const handleSignIn = () => {
    setIsSignedIn(true)
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

  // Show loading state while checking localStorage
  if (isLoadingSignIn || isLoadingOnboarding || isLoadingSplash || isLoadingLanding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
  if (showSplashScreen || (isSignedIn && !hasSplashCompleted)) {
    return (
      <div className="min-h-screen bg-background">
        <SplashScreenPage onComplete={handleSplashComplete} />
      </div>
    )
  }

  // Check if user is signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <SignInPage onSignIn={handleSignIn} />
      </div>
    )
  }

  // Check if user has completed onboarding
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingPage onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  const renderPage = () => {
    switch (activeTab) {
      case "learning":
        return <DailyLearningPage />
      case "dashboard":
        return <DashboardPage />
      case "classes":
        return <ClassesPage />
      case "visualization":
        return <ProgressPage />
      case "settings":
        return <SettingsPage />
      case "profile":
        return <ProfilePage />
      default:
        return <DailyLearningPage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderPage()}
      </MainLayout>
    </div>
  )
}
