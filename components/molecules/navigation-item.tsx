"use client"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"

interface NavigationItemProps {
  title: string
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
}

export function NavigationItem({ title, icon: Icon, isActive, onClick }: NavigationItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={onClick} isActive={isActive} tooltip={title} size="lg">
        <Icon className="h-6 w-6 flex-shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden text-base font-medium">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
