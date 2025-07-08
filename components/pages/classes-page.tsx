"use client"

import { useRouter } from "next/navigation"
import { SubjectCarousel } from "@/components/organisms/subject-carousel"

// Hardcoded data for subjects and topics
const subjectsData = [
  {
    title: "Math",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    topics: [
      {
        id: "college-algebra",
        title: "College Algebra",
        description: "Master fundamental algebraic concepts and problem-solving techniques",
        chapters: 12,
        items: 48,
        progress: 65
      },
      {
        id: "statistics",
        title: "Statistics",
        description: "Learn data analysis, probability, and statistical inference",
        chapters: 8,
        items: 32,
        progress: 30
      }
    ]
  },
  {
    title: "Literature",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    topics: [
      {
        id: "writing",
        title: "Writing",
        description: "Develop creative and academic writing skills",
        chapters: 10,
        items: 40,
        progress: 45
      }
    ]
  },
  {
    title: "Humanities",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    topics: [
      {
        id: "philosophy",
        title: "Philosophy",
        description: "Explore fundamental questions about existence, knowledge, and ethics",
        chapters: 15,
        items: 60,
        progress: 20
      },
      {
        id: "world-history",
        title: "World History",
        description: "Journey through the major events and civilizations of human history",
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
        title: "Anatomy",
        description: "Learn about the structure and organization of the human body",
        chapters: 16,
        items: 64,
        progress: 40
      }
    ]
  }
]

export function ClassesPage() {
  const router = useRouter()

  const handleTopicClick = (topicId: string) => {
    // Navigate to topic overview page
    router.push(`/topic/${topicId}`)
  }

  const handlePlayClick = (topicId: string) => {
    // Navigate to topic learning page
    router.push(`/topic/${topicId}`)
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