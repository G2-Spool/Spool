"use client"

import { BookOpen, Home, BarChart3, Settings, User } from "lucide-react"
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

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Study",
      icon: BookOpen,
      value: "learning",
    },
    {
      title: "Dashboard",
      icon: Home,
      value: "dashboard",
    },
    {
      title: "Progress",
      icon: BarChart3,
      value: "visualization",
    },
  ]

  const bottomItems = [
    {
      title: "Settings",
      icon: Settings,
      value: "settings",
    },
    {
      title: "Profile",
      icon: User,
      value: "profile",
    },
  ]

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
                  <SidebarMenuButton onClick={() => onTabChange(item.value)} isActive={activeTab === item.value}>
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
                    <SidebarMenuButton onClick={() => onTabChange(item.value)} isActive={activeTab === item.value}>
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
