"use client"

import React, { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConceptSidebar } from "@/components/learning-modules/concept-sidebar"
import { LearningContent } from "@/components/learning-modules/learning-content"
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

  const handleAssignmentComplete = async (assignmentId: string, response: string) => {
    console.log(`Assignment ${assignmentId} completed with response:`, response)
    // In a real app, this would send to backend and update the assignment state
    // For demo purposes, we'll simulate completion
    setTimeout(() => {
      console.log('Assignment marked as complete')
    }, 1000)
  }

  const handleAssignmentUpdateResponse = (assignmentId: string, response: string) => {
    console.log(`Assignment ${assignmentId} response updated:`, response)
    // In a real app, this would auto-save the response
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
            <Card className="bg-muted/20 border-muted/20">
              <CardContent className="p-6">
                {/* Header in main content area */}
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-2">
                    {conceptTitle || "Learning"}
                  </h1>
                  <p className="text-base text-muted-foreground">Interactive Learning Experience</p>
                </div>

                {/* Learning Content */}
                {currentConcept ? (
                  <LearningContent
                    concept={currentConcept}
                    onAssignmentComplete={handleAssignmentComplete}
                    onAssignmentUpdateResponse={handleAssignmentUpdateResponse}
                  />
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Concept Not Found</h2>
                    <p className="text-muted-foreground">
                      The requested concept could not be found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 