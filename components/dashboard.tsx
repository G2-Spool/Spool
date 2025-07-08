"use client"

import { DashboardPage } from "@/components/pages/dashboard-page"
import { ClassesPage } from "@/components/pages/classes-page"
import { ProgressPage } from "@/components/pages/progress-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { DailyLearningPage } from "@/components/pages/daily-learning-page"

interface DashboardProps {
  activeTab?: string
}

export function Dashboard({ activeTab = "dashboard" }: DashboardProps) {
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
        return <DashboardPage />
    }
  }

  return renderPage()
}
