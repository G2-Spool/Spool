"use client"

import { BookOpen, Home, BarChart3, User } from "lucide-react"
import { useUnifiedNavigation, AppTab } from "@/hooks/use-unified-navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { navigateToTab, isTabActive } = useUnifiedNavigation()
  
  const menuItems = [
    {
      title: "Study",
      icon: BookOpen,
      value: "learning" as AppTab,
    },
    {
      title: "Dashboard",
      icon: Home,
      value: "dashboard" as AppTab,
    },
    {
      title: "Progress",
      icon: BarChart3,
      value: "visualization" as AppTab,
    },
  ]

  const bottomItems = [
    {
      title: "Profile",
      icon: User,
      value: "profile" as AppTab,
    },
  ]

  const handleNavigation = (value: AppTab) => {
    navigateToTab(value)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center space-x-2">
          <img src="/spool-logo.png" alt="Spool" className="h-4 w-4" />
          <span className="text-lg font-semibold text-foreground">Spool</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton onClick={() => handleNavigation(item.value)} isActive={isTabActive(item.value)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton onClick={() => handleNavigation(item.value)} isActive={isTabActive(item.value)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
