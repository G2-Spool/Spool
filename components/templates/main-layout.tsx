"use client"

import type React from "react"
import { SidebarNavigation } from "@/components/organisms/sidebar-navigation"
import { Separator } from "@/components/ui/separator"

interface MainLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
}

export function MainLayout({ activeTab, onTabChange, children }: MainLayoutProps) {
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "learning":
        return "Study Session"
      case "dashboard":
        return "Dashboard"
      case "visualization":
        return "Learning Progress"
      case "settings":
        return "Settings"
      case "profile":
        return "Profile"
      default:
        return "Learning Companion"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">{getPageTitle(activeTab)}</h1>
          </div>
        </header>
        <div className="flex-1 space-y-4 p-6 bg-background">{children}</div>
      </main>
    </div>
  )
}
