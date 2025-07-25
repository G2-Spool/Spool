"use client"

import type React from "react"
import { SidebarNavigation } from "@/components/organisms/sidebar-navigation"

import { Sidebar, useSidebar } from "@/components/ui/sidebar"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  allowOverflow?: boolean
}

function MainLayoutContent({ children, title, allowOverflow = false }: MainLayoutProps) {
  const { open } = useSidebar()
  const { activeTab } = useUnifiedNavigation()
  
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
        return "Profile"
      case "profile":
        return "Profile"
      default:
        return "Spool"
    }
  }

  // const displayTitle = title || getPageTitle(activeTab)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation />
      <main className={`flex flex-col transition-all duration-200 ${open ? 'ml-20 md:ml-[300px]' : 'ml-20 md:ml-20'}`}>
        <div className={cn(
          "flex-1 space-y-4 p-6 bg-background",
          !allowOverflow && "overflow-hidden"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}

export function MainLayout({ children, title, allowOverflow }: MainLayoutProps) {
  return (
    <Sidebar>
      <MainLayoutContent title={title} allowOverflow={allowOverflow}>
        {children}
      </MainLayoutContent>
    </Sidebar>
  )
}
