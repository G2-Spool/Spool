"use client"

import { TopicPage } from "@/components/pages/topic-page"
import { MainLayout } from "@/components/templates/main-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useParams } from "next/navigation"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

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
  return titleMap[topicId] || "My Classes"
}

function TopicContent() {
  const params = useParams()
  const { navigateToTab } = useUnifiedNavigation()
  const topicId = params.topicId as string
  const topicTitle = getTopicTitle(topicId)

  const handleBack = () => {
    navigateToTab("classes")
  }

  return (
    <div className="min-h-screen bg-background">
      <MainLayout title={topicTitle}>
        <TopicPage
          topicId={topicId}
          title=""
          sections={[]}
          onBack={handleBack}
        />
      </MainLayout>
    </div>
  )
}

export default function TopicRoute() {
  return (
    <AuthGuard>
      <TopicContent />
    </AuthGuard>
  )
} 