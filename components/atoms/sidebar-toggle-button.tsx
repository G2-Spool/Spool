"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarToggleButton() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleSidebar}
      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-md border-2 border-border bg-card shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200 font-bold"
      aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
    >
      {state === "expanded" ? (
        <ChevronLeft className="h-5 w-5 font-bold" />
      ) : (
        <ChevronRight className="h-5 w-5 font-bold" />
      )}
    </Button>
  )
}
