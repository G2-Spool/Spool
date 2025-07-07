"use client"

import { BookOpen, Home, BarChart3, Settings, User, GraduationCap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavigationItem } from "@/components/molecules/navigation-item"
import { SidebarToggleButton } from "@/components/atoms/sidebar-toggle-button"

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const menuItems = [
    { title: "Study", icon: BookOpen, value: "learning" },
    { title: "Dashboard", icon: Home, value: "dashboard" },
    { title: "Progress", icon: BarChart3, value: "visualization" },
  ]

  const bottomItems = [
    { title: "Settings", icon: Settings, value: "settings" },
    { title: "Profile", icon: User, value: "profile" },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r relative">
      <SidebarHeader className="border-b border-border/40 p-4 group-data-[collapsible=icon]:p-3">
        <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
          <GraduationCap className="h-8 w-8 text-primary flex-shrink-0" />
          <span className="text-xl font-bold text-foreground truncate group-data-[collapsible=icon]:hidden">
            Learning Companion
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <NavigationItem
                  key={item.value}
                  title={item.title}
                  icon={item.icon}
                  isActive={activeTab === item.value}
                  onClick={() => onTabChange(item.value)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {bottomItems.map((item) => (
                  <NavigationItem
                    key={item.value}
                    title={item.title}
                    icon={item.icon}
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarRail />

      {/* Toggle button positioned inside the sidebar */}
      <SidebarToggleButton />
    </Sidebar>
  )
}
