"use client"

import { DailyLearningPage } from "@/components/pages/daily-learning-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { ClassesPage } from "@/components/pages/classes-page"
import { ProgressPage } from "@/components/pages/progress-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

export function Dashboard() {
  const { activeTab } = useUnifiedNavigation()
  
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
        return <ProfilePage />
      case "profile":
        return <ProfilePage />
      default:
        return <DashboardPage />
    }
  }

  return renderPage()
}
