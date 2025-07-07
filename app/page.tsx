"use client"

import { useState } from "react"
import { useLocalStorageBoolean } from "@/hooks/use-local-storage"
import { MainLayout } from "@/components/templates/main-layout"
import { OnboardingPage } from "@/components/pages/onboarding-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { DailyLearning } from "@/components/daily-learning"
import { LearningVisualization } from "@/components/learning-visualization"
import { Settings } from "@/components/settings"
import { Profile } from "@/components/profile"

export default function App() {
  const [isOnboarded, setIsOnboarded, isLoadingOnboarding] = useLocalStorageBoolean("onboarding-complete", false)
  const [activeTab, setActiveTab] = useState("learning")

  const handleOnboardingComplete = () => {
    setIsOnboarded(true)
  }

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
        return <DailyLearning />
      case "dashboard":
        return <DashboardPage />
      case "visualization":
        return <LearningVisualization />
      case "settings":
        return <Settings />
      case "profile":
        return <Profile />
      default:
        return <DailyLearning />
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
