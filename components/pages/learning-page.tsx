"use client"

import React from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LearningPageProps {
  conceptId: string
  conceptTitle?: string
  onBack?: () => void
}

export function LearningPage({ conceptId, conceptTitle, onBack }: LearningPageProps) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white -mx-6 -mt-6 px-6 py-16 relative">
        <div className="absolute left-4 top-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              {conceptTitle || "Learning"}
            </h1>
            <p className="text-white/80 mt-2">Concept ID: {conceptId}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Learning Page</h2>
            <p className="text-muted-foreground">
              This learning page is currently empty. Content will be added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 