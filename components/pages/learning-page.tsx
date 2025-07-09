"use client"

import React, { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConceptSidebar } from "@/components/learning-modules/concept-sidebar"
import { ConceptPresentation } from "@/components/learning"
import { ConceptItem } from "@/components/learning-modules/types"
import { sampleConcepts } from "@/components/learning-modules/sample-content"

interface LearningPageProps {
  conceptId: string
  conceptTitle?: string
  onBack?: () => void
}

export function LearningPage({ conceptId, conceptTitle, onBack }: LearningPageProps) {
  // Use sample concepts with equation examples
  const mockConcepts: ConceptItem[] = sampleConcepts

  const [currentConceptId, setCurrentConceptId] = useState(conceptId || "introduction-to-functions")
  const currentConcept = mockConcepts.find(c => c.id === currentConceptId)

  const handleConceptSelect = (id: string) => {
    setCurrentConceptId(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - More prominent on the left */}
          <div className="lg:col-span-1">
            <ConceptSidebar
              concepts={mockConcepts}
              currentConceptId={currentConceptId}
              onConceptSelect={handleConceptSelect}
              onBack={onBack}
            />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Concept Presentation */}
            <ConceptPresentation
              conceptId={currentConceptId}
              conceptTitle={currentConcept?.title || conceptTitle}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 