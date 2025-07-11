"use client"

import { BarChart3, BookOpen, Home, User, LucideIcon } from "lucide-react"
import { SidebarLink, SidebarBody } from "../ui/sidebar"
import { motion } from "framer-motion"
import Link from "next/link"
import { useUnifiedNavigation, AppTab } from "@/hooks/use-unified-navigation"

interface MenuItem {
  label: string
  value: AppTab
  href: string
  icon: LucideIcon
}

export function SidebarNavigation() {
  const { navigateToTab, isTabActive } = useUnifiedNavigation()
  
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
      label: "Profile", 
      value: "profile",
      href: "/?tab=profile", 
      icon: User
    },
  ]

  const handleLinkClick = (value: AppTab, e: React.MouseEvent) => {
    e.preventDefault()
    navigateToTab(value)
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
              const isActive = isTabActive(item.value)
              
              return (
                <SidebarLink 
                  key={idx} 
                  link={{
                    ...item,
                    icon: <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-accent-foreground' : 'text-sidebar-foreground'}`} />
                  }}
                  onClick={(e) => handleLinkClick(item.value, e)}
                  className={isActive ? "bg-accent text-accent-foreground font-medium" : ""}
                />
              )
            })}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {bottomItems.map((item, idx) => {
            const IconComponent = item.icon
            const isActive = isTabActive(item.value)
            
            return (
              <SidebarLink 
                key={idx} 
                link={{
                  ...item,
                  icon: <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-accent-foreground' : 'text-sidebar-foreground'}`} />
                }}
                onClick={(e) => handleLinkClick(item.value, e)}
                className={isActive ? "bg-accent text-accent-foreground font-medium" : ""}
              />
            )
          })}
        </div>
    </SidebarBody>
  )
}
