"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLocalStorageBoolean } from "@/hooks/use-local-storage"
import { MainLayout } from "@/components/templates/main-layout"
import { OnboardingPage } from "@/components/pages/onboarding-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { DailyLearningPage } from "@/components/pages/daily-learning-page"
import { ProgressPage } from "@/components/pages/progress-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { ClassesPage } from "@/components/pages/classes-page"

export default function App() {
  const [isOnboarded, setIsOnboarded, isLoadingOnboarding] = useLocalStorageBoolean("onboarding-complete", false)
  const [activeTab, setActiveTab] = useState("learning")
  const searchParams = useSearchParams()

  const handleOnboardingComplete = () => {
    setIsOnboarded(true)
  }

  // Check for URL parameters to set the active tab
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["learning", "dashboard", "classes", "visualization", "settings", "profile"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Show loading state while checking localStorage
  if (isLoadingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

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
