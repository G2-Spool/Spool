"use client"

import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { SubjectCarousel } from "@/components/organisms/subject-carousel"

// Import the topic data from topic-page.tsx
import { getTopicData } from "./topic-page"

// Utility function to calculate actual section and concept counts
const calculateTopicStats = (topicId: string) => {
  const topicData = getTopicData(topicId)
  
  // Count sections (excluding overview)
  const sections = topicData.sections.filter((section: any) => section.id !== "overview").length
  
  // Count total concepts across all sections
  const concepts = topicData.sections.reduce((total: number, section: any) => {
    return total + (section.concepts?.length || 0)
  }, 0)
  
  return { sections, concepts }
}

const subjectsData = [
  {
    title: "Mathematics",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    topics: [
      {
        id: "college-algebra",
        title: "College Algebra",
        description: "Master algebraic concepts and problem-solving techniques",
        ...calculateTopicStats("college-algebra"),
        progress: 45
      },
      {
        id: "statistics",
        title: "Introductory Statistics",
        description: "Learn statistical analysis and data interpretation",
        ...calculateTopicStats("statistics"),
        progress: 30
      }
    ]
  },
  {
    title: "Humanities",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    topics: [
      {
        id: "writing",
        title: "Writing Guide",
        description: "Develop your writing skills and communication abilities",
        ...calculateTopicStats("writing"),
        progress: 60
      },
      {
        id: "philosophy",
        title: "Introduction to Philosophy",
        description: "Explore fundamental questions about existence and knowledge",
        ...calculateTopicStats("philosophy"),
        progress: 25
      },
      {
        id: "world-history",
        title: "World History, Volume 2: from 1400",
        description: "Journey through major events and civilizations",
        ...calculateTopicStats("world-history"),
        progress: 15
      }
    ]
  },
  {
    title: "Science",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    topics: [
      {
        id: "biology",
        title: "Biology",
        description: "Study living organisms and their interactions with the environment",
        ...calculateTopicStats("biology"),
        progress: 75
      },
      {
        id: "anatomy",
        title: "Anatomy and Physiology",
        description: "Learn about the structure and organization of the human body",
        ...calculateTopicStats("anatomy"),
        progress: 40
      }
    ]
  }
]

export function ClassesPage() {
  const { navigateToTopic } = useUnifiedNavigation()

  const handleTopicClick = (topicId: string) => {
    navigateToTopic(topicId)
  }

  const handlePlayClick = (topicId: string) => {
    navigateToTopic(topicId)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground text-lg">
            Explore your subjects and track your learning progress
          </p>
        </div>

        <div className="space-y-16">
          {subjectsData.map((subject) => (
            <SubjectCarousel
              key={subject.title}
              title={subject.title}
              topics={subject.topics}
              color={subject.color}
              onTopicClick={handleTopicClick}
              onPlayClick={handlePlayClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 