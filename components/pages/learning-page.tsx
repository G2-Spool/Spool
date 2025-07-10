"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConceptSidebar } from "@/components/learning-modules/concept-sidebar"
import { ConceptPresentation } from "@/components/learning"
import { ConceptItem } from "@/components/learning-modules/types"
import { sampleConcepts } from "@/components/learning-modules/sample-content"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Backend Services - COMMENTED OUT FOR NOW
// import { getTopicById, getTopicWithProgress, getConceptById, getConceptWithProgress } from "@/services/content"
// import { getTopicProgress, getUserProgress, markConceptStarted, trackTimeSpent } from "@/services/progress"
// import { Topic, Section, Concept, UserProgress } from "@/types/backend"

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
  const { user } = useAuth()
  
  // State for backend data - COMMENTED OUT FOR NOW
  // const [topic, setTopic] = useState<Topic | null>(null)
  // const [concept, setConcept] = useState<Concept | null>(null)
  // const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)
  // const [startTime, setStartTime] = useState<number>(Date.now())
  
  // Mock data for now
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  
  // Extract topicId from URL path if not provided as prop
  const extractTopicIdFromPath = () => {
    const pathParts = pathname.split('/')
    const topicIndex = pathParts.indexOf('topic')
    if (topicIndex !== -1 && pathParts[topicIndex + 1]) {
      return pathParts[topicIndex + 1]
    }
    return null
  }
  
  const effectiveTopicId = topicId || extractTopicIdFromPath()
  const [currentConceptId, setCurrentConceptId] = useState(conceptId || "introduction-to-functions")

  // Load data from backend - COMMENTED OUT FOR NOW
  /*
  useEffect(() => {
    const loadData = async () => {
      if (!user || !effectiveTopicId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Load topic with progress
        const topicData = await getTopicWithProgress(effectiveTopicId, user.sub)
        if (topicData) {
          setTopic(topicData)
        }

        // Load user progress for this topic
        const progressData = await getTopicProgress(user.sub, effectiveTopicId)
        setUserProgress(progressData)

        // Load current concept with progress
        const conceptData = await getConceptWithProgress(currentConceptId, user.sub)
        if (conceptData) {
          setConcept(conceptData)
        }

        // Mark concept as started if not already
        if (user.sub && currentConceptId) {
          await markConceptStarted(user.sub, currentConceptId)
        }

      } catch (err) {
        console.error('Error loading learning data:', err)
        setError('Failed to load learning content. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, effectiveTopicId, currentConceptId])
  */

  // Track time spent when component unmounts or concept changes - COMMENTED OUT FOR NOW
  /*
  useEffect(() => {
    const trackTime = async () => {
      if (user && currentConceptId && startTime) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60) // Convert to minutes
        if (timeSpent > 0) {
          await trackTimeSpent(user.sub, currentConceptId, timeSpent)
        }
      }
    }

    // Track time when concept changes
    return () => {
      trackTime()
    }
  }, [user, currentConceptId, startTime])
  */

  // Transform backend data to component format - COMMENTED OUT FOR NOW
  /*
  const transformConceptsToConceptItems = (concepts: Concept[], progress: UserProgress[]): ConceptItem[] => {
    return concepts.map(concept => {
      const conceptProgress = progress.find(p => p.concept_id === concept.id)
      return {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        completed: (conceptProgress?.progress_percentage ?? 0) >= 100,
        locked: false, // TODO: Implement prerequisite logic
        progress: conceptProgress?.progress_percentage ?? 0,
        modules: [] // Use empty array for now, will be populated by learning modules
      }
    })
  }
  */

  // Get concepts from topic sections or fallback to sample data - USING MOCK DATA FOR NOW
  const getConceptsForSidebar = (): ConceptItem[] => {
    /* COMMENTED OUT BACKEND INTEGRATION
    if (topic?.sections && topic.sections.length > 0) {
      // Find the section containing the current concept
      const currentSection = topic.sections.find(section => 
        section.concepts?.some(c => c.id === currentConceptId)
      )
      
      if (currentSection?.concepts) {
        return transformConceptsToConceptItems(currentSection.concepts, userProgress)
      }
      
      // If no section found, use all concepts from first section
      if (topic.sections[0]?.concepts) {
        return transformConceptsToConceptItems(topic.sections[0].concepts, userProgress)
      }
    }
    */
    
    // Fallback to legacy section prop or sample data
    if (section?.concepts) {
      return section.concepts.map(concept => ({
        id: concept.id,
        title: concept.title,
        description: concept.description,
        completed: concept.completed,
        locked: concept.locked,
        progress: concept.progress,
        modules: []
      }))
    }
    
    return sampleConcepts
  }

  const sectionConcepts = getConceptsForSidebar()
  const currentConcept = sectionConcepts.find(c => c.id === currentConceptId)

  const handleConceptSelect = async (id: string) => {
    // Track time spent on previous concept - COMMENTED OUT FOR NOW
    /*
    if (user && currentConceptId && startTime) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60)
      if (timeSpent > 0) {
        await trackTimeSpent(user.sub, currentConceptId, timeSpent)
      }
    }
    */

    // Set new concept and reset timer
    setCurrentConceptId(id)
    setStartTime(Date.now())
    
    // Mark new concept as started - COMMENTED OUT FOR NOW
    /*
    if (user) {
      await markConceptStarted(user.sub, id)
    }
    */
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your personalized learning content...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 text-xl">⚠️</div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No user authenticated - COMMENTED OUT FOR NOW (using mock data)
  /*
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-yellow-500 text-xl">🔐</div>
            <h2 className="text-lg font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access your personalized learning content.</p>
            <Button onClick={() => window.location.href = '/auth/signin'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  */

  // Mock topic data for header
  const mockTopic = {
    title: "Advanced Mathematics",
    description: "Explore complex mathematical concepts and problem-solving techniques",
    category: "Mathematics",
    difficulty_level: "intermediate"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header with topic title - USING MOCK DATA FOR NOW */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{mockTopic.category}</span>
            <span>•</span>
            <span className="capitalize">{mockTopic.difficulty_level}</span>
          </div>
          <h1 className="text-2xl font-bold">{mockTopic.title}</h1>
          <p className="text-muted-foreground mt-1">{mockTopic.description}</p>
        </div>

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
            <ConceptPresentation
              conceptId={currentConceptId}
              conceptTitle={currentConcept?.title || conceptTitle}
              topicId={effectiveTopicId || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 