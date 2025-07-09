"use client"

import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { SubjectCarousel } from "@/components/organisms/subject-carousel"

const subjectsData = [
  {
    title: "Mathematics",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    topics: [
      {
        id: "college-algebra",
        title: "College Algebra",
        description: "Master algebraic concepts and problem-solving techniques",
        chapters: 12,
        items: 48,
        progress: 45
      },
      {
        id: "statistics",
        title: "Introductory Statistics",
        description: "Learn statistical analysis and data interpretation",
        chapters: 10,
        items: 40,
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
        chapters: 8,
        items: 32,
        progress: 60
      },
      {
        id: "philosophy",
        title: "Introduction to Philosophy",
        description: "Explore fundamental questions about existence and knowledge",
        chapters: 15,
        items: 60,
        progress: 25
      },
      {
        id: "world-history",
        title: "World History, Volume 2: from 1400",
        description: "Journey through major events and civilizations",
        chapters: 20,
        items: 80,
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
        chapters: 14,
        items: 56,
        progress: 75
      },
      {
        id: "anatomy",
        title: "Anatomy and Physiology",
        description: "Learn about the structure and organization of the human body",
        chapters: 16,
        items: 64,
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