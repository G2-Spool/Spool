"use client"

import React, { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConceptSidebar } from "@/components/learning-modules/concept-sidebar"
import { ConceptPresentation } from "@/components/learning"
import { ConceptItem } from "@/components/learning-modules/types"
import { sampleConcepts } from "@/components/learning-modules/sample-content"
import { getTopicData } from "./topic-page"
import { usePathname } from "next/navigation"

interface LearningPageProps {
  conceptId: string
  conceptTitle?: string
  topicId?: string
  section?: {
    id: string
    title: string
    description?: string
    concepts?: {
      id: string
      title: string
      description: string
      completed: boolean
      locked: boolean
      progress: number
    }[]
    content?: string
  }
  onBack?: () => void
}

export function LearningPage({ conceptId, conceptTitle, topicId, section, onBack }: LearningPageProps) {
  const pathname = usePathname()
  
  // Extract topicId from URL path if not provided as prop
  // URL pattern: /topic/college-algebra/learn/linear-equations-one-variable
  const extractTopicIdFromPath = () => {
    const pathParts = pathname.split('/')
    const topicIndex = pathParts.indexOf('topic')
    if (topicIndex !== -1 && pathParts[topicIndex + 1]) {
      return pathParts[topicIndex + 1]
    }
    return null
  }
  
  const effectiveTopicId = topicId || extractTopicIdFromPath()
  
  // Debug logging
  console.log('LearningPage - conceptId:', conceptId)
  console.log('LearningPage - topicId prop:', topicId)
  console.log('LearningPage - pathname:', pathname)
  console.log('LearningPage - effectiveTopicId:', effectiveTopicId)
  console.log('LearningPage - section:', section)
  
  // Dynamically find section data using topicId and conceptId
  const findSectionForConcept = (topicId: string, conceptId: string) => {
    if (!topicId || !conceptId) return null
    
    const topicData = getTopicData(topicId)
    for (const section of topicData.sections) {
      if (section.concepts) {
        const foundConcept = section.concepts.find(c => c.id === conceptId)
        if (foundConcept) {
          return section
        }
      }
    }
    return null
  }
  
  // Use dynamic section finding if effectiveTopicId is available, otherwise use passed section
  const dynamicSection = effectiveTopicId ? findSectionForConcept(effectiveTopicId, conceptId) : null
  const activeSection = dynamicSection || section
  
  console.log('LearningPage - activeSection:', activeSection)
  console.log('LearningPage - activeSection?.concepts:', activeSection?.concepts)
  
  // Use section concepts if available, otherwise fall back to sample concepts
  const sectionConcepts: ConceptItem[] = activeSection?.concepts?.map(concept => ({
    id: concept.id,
    title: concept.title,
    description: concept.description,
    completed: concept.completed,
    locked: concept.locked,
    progress: concept.progress,
    modules: [] // Default empty modules for sidebar display
  })) || sampleConcepts
  
  console.log('LearningPage - using sectionConcepts:', sectionConcepts)

  const [currentConceptId, setCurrentConceptId] = useState(conceptId || "introduction-to-functions")
  const currentConcept = sectionConcepts.find(c => c.id === currentConceptId)

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
              concepts={sectionConcepts}
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