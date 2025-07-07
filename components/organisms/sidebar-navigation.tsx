"use client"

import { BookOpen, Home, BarChart3, Settings, User, GraduationCap, LucideIcon } from "lucide-react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import { motion } from "framer-motion"
import Link from "next/link"

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

interface MenuItem {
  label: string
  value: string
  href: string
  icon: LucideIcon
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const menuItems: MenuItem[] = [
    { 
      label: "Dashboard", 
      value: "dashboard",
      href: "#", 
      icon: Home
    },
    { 
      label: "Courses", 
      value: "learning",
      href: "#", 
      icon: BookOpen
    },
    { 
      label: "Progress", 
      value: "visualization",
      href: "#", 
      icon: BarChart3
    },
  ]

  const bottomItems: MenuItem[] = [
    { 
      label: "Settings", 
      value: "settings",
      href: "#", 
      icon: Settings
    },
    { 
      label: "Profile", 
      value: "profile",
      href: "#", 
      icon: User
    },
  ]

  const handleLinkClick = (value: string) => {
    onTabChange(value)
  }

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-2">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div 
            className="flex items-center space-x-3 p-4 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent transition-colors"
            onClick={() => handleLinkClick("dashboard")}
          >
            <GraduationCap className="h-6 w-6 text-primary flex-shrink-0" />
            <motion.span 
              className="text-xl font-bold text-sidebar-foreground truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Spool
            </motion.span>
          </div>
          
          <div className="mt-8 flex flex-col gap-2">
            {menuItems.map((item, idx) => {
              const IconComponent = item.icon
              return (
                <SidebarLink 
                  key={idx} 
                  link={{
                    ...item,
                    icon: <IconComponent className={`h-5 w-5 flex-shrink-0 ${activeTab === item.value ? 'text-accent-foreground' : 'text-sidebar-foreground'}`} />
                  }}
                  onClick={() => handleLinkClick(item.value)}
                  className={activeTab === item.value ? "bg-accent text-accent-foreground font-medium" : ""}
                />
              )
            })}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {bottomItems.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <SidebarLink 
                key={idx} 
                link={{
                  ...item,
                  icon: <IconComponent className={`h-5 w-5 flex-shrink-0 ${activeTab === item.value ? 'text-accent-foreground' : 'text-sidebar-foreground'}`} />
                }}
                onClick={() => handleLinkClick(item.value)}
                className={activeTab === item.value ? "bg-accent text-accent-foreground font-medium" : ""}
              />
            )
          })}
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
