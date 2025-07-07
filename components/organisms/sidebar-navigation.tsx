"use client"

import { BookOpen, Home, BarChart3, Settings, User, GraduationCap } from "lucide-react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import { motion } from "framer-motion"
import Link from "next/link"

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const menuItems = [
    { 
      label: "Study", 
      value: "learning",
      href: "#", 
      icon: <BookOpen className="text-sidebar-foreground h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: "Dashboard", 
      value: "dashboard",
      href: "#", 
      icon: <Home className="text-sidebar-foreground h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: "Progress", 
      value: "visualization",
      href: "#", 
      icon: <BarChart3 className="text-sidebar-foreground h-5 w-5 flex-shrink-0" /> 
    },
  ]

  const bottomItems = [
    { 
      label: "Settings", 
      value: "settings",
      href: "#", 
      icon: <Settings className="text-sidebar-foreground h-5 w-5 flex-shrink-0" /> 
    },
    { 
      label: "Profile", 
      value: "profile",
      href: "#", 
      icon: <User className="text-sidebar-foreground h-5 w-5 flex-shrink-0" /> 
    },
  ]

  const handleLinkClick = (value: string) => {
    onTabChange(value)
  }

  return (
    <Sidebar>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center space-x-3 p-4 border-b border-sidebar-border">
            <GraduationCap className="h-8 w-8 text-primary flex-shrink-0" />
            <motion.span 
              className="text-xl font-bold text-sidebar-foreground truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Learning Companion
            </motion.span>
          </div>
          
          <div className="mt-8 flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <SidebarLink 
                key={idx} 
                link={item}
                onClick={() => handleLinkClick(item.value)}
                className={activeTab === item.value ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
              />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {bottomItems.map((item, idx) => (
            <SidebarLink 
              key={idx} 
              link={item}
              onClick={() => handleLinkClick(item.value)}
              className={activeTab === item.value ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
            />
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
