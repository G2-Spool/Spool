"use client"

import { LearningPage } from "@/components/pages/learning-page"
import { MainLayout } from "@/components/templates/main-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useParams } from "next/navigation"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

// Simple function to get concept title from ID (you might want to enhance this)
const getConceptTitle = (conceptId: string) => {
  // This is a basic mapping - you might want to fetch this from your data source
  const titleMap: Record<string, string> = {
    "linear-equations": "Linear Equations",
    "quadratic-equations": "Quadratic Equations",
    "systems-equations": "Systems of Equations",
    "functions-graphs": "Functions and Graphs",
    "polynomials": "Polynomials",
    "exponential-logarithmic": "Exponential and Logarithmic Functions",
    // Add more mappings as needed
  }
  return titleMap[conceptId] || conceptId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Simple function to get topic title from ID
const getTopicTitle = (topicId: string) => {
  const titleMap: Record<string, string> = {
    "college-algebra": "College Algebra",
    "statistics": "Statistics",
    "data-structures-algorithms": "Data Structures and Algorithms",
    "writing": "Writing",
    "philosophy": "Philosophy",
    "world-history": "World History",
    "biology": "Biology",
    "anatomy": "Anatomy"
  }
  return titleMap[topicId] || "Learning"
}

function LearningContent() {
  const params = useParams()
  const { navigateToUrl } = useUnifiedNavigation()
  const topicId = params.topicId as string
  const conceptId = params.conceptId as string
  
  const conceptTitle = getConceptTitle(conceptId)
  const topicTitle = getTopicTitle(topicId)

  const handleBack = () => {
    // Navigate back to the topic overview
    navigateToUrl(`/topic/${topicId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainLayout title={`${topicTitle} - ${conceptTitle}`}>
        <LearningPage
          conceptId={conceptId}
          conceptTitle={conceptTitle}
          onBack={handleBack}
        />
      </MainLayout>
    </div>
  )
}

export default function LearningRoute() {
  return (
    <AuthGuard>
      <LearningContent />
    </AuthGuard>
  )
} 