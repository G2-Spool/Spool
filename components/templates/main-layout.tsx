"use client"

import type React from "react"
import { SidebarNavigation } from "@/components/organisms/sidebar-navigation"
import { Separator } from "@/components/ui/separator"

interface MainLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  title?: string
}

export function MainLayout({ activeTab, onTabChange, children, title }: MainLayoutProps) {
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "learning":
        return "Courses"
      case "dashboard":
        return "Dashboard"
      case "classes":
        return "My Classes"
      case "visualization":
        return "Learning Progress"
      case "settings":
        return "Settings"
      case "profile":
        return "Profile"
      default:
        return "Spool"
    }
  }

  const displayTitle = title || getPageTitle(activeTab)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 p-6 bg-background overflow-hidden">{children}</div>
      </main>
    </div>
  )
}
