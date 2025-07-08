"use client"

import { BarChart3, BookOpen, Home, Settings, User, LucideIcon } from "lucide-react"
import { SidebarLink, SidebarBody } from "../ui/sidebar"
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
      href: "/?tab=dashboard", 
      icon: Home
    },
    { 
      label: "Classes", 
      value: "classes",
      href: "/?tab=classes", 
      icon: BookOpen
    },
    { 
      label: "Progress", 
      value: "visualization",
      href: "/?tab=visualization", 
      icon: BarChart3
    },
  ]

  const bottomItems: MenuItem[] = [
    { 
      label: "Settings", 
      value: "settings",
      href: "/?tab=settings", 
      icon: Settings
    },
    { 
      label: "Profile", 
      value: "profile",
      href: "/?tab=profile", 
      icon: User
    },
  ]

  const handleLinkClick = (value: string, e: React.MouseEvent) => {
    // For same-page navigation, prevent default link behavior and use onTabChange
    if (window.location.pathname === '/') {
      e.preventDefault()
      onTabChange(value)
    }
    // For navigation from other pages (like topic pages), let the Link handle it normally
  }

  return (
    <SidebarBody className="justify-between gap-2 h-screen">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Link
            href="/?tab=dashboard"
            className="flex items-center space-x-3 p-4 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent transition-colors"
            onClick={(e) => handleLinkClick("dashboard", e)}
          >
            <img src="/spool-logo.png" alt="Spool" className="h-6 w-6 flex-shrink-0" />
            <motion.span 
              className="text-xl font-bold text-sidebar-foreground truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Spool
            </motion.span>
          </Link>
          
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
                  onClick={(e) => handleLinkClick(item.value, e)}
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
                onClick={(e) => handleLinkClick(item.value, e)}
                className={activeTab === item.value ? "bg-accent text-accent-foreground font-medium" : ""}
              />
            )
          })}
        </div>
      </SidebarBody>
  )
}
