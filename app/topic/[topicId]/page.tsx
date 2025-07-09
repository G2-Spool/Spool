"use client"

import { TopicPage } from "@/components/pages/topic-page"
import { MainLayout } from "@/components/templates/main-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"

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
  const router = useRouter()
  const { navigateWithLoading } = useNavigationLoading()
  const topicId = params.topicId as string
  const topicTitle = getTopicTitle(topicId)

  const handleBack = () => {
    // Navigate to the root path and set active tab to classes with loading
    navigateWithLoading("/?tab=classes")
  }

  const handleTabChange = (tab: string) => {
    // Navigate to the root path with the selected tab with loading
    navigateWithLoading(`/?tab=${tab}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainLayout activeTab="classes" onTabChange={handleTabChange} title={topicTitle}>
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