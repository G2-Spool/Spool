"use client"

import { SidebarDemo } from "@/components/ui/sidebar-demo"

export default function TestSidebarPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Sidebar Demo</h1>
        <SidebarDemo />
      </div>
    </div>
  )
} 