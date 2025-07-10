"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/templates/page-header"
import { StatsGrid } from "@/components/organisms/stats-grid"
import { StudyFocusCard } from "@/components/organisms/study-focus-card"
import { InterestsCard } from "@/components/organisms/interests-card"
import { AchievementsList } from "@/components/organisms/achievements-list"
import { WeeklyProgressCard } from "@/components/organisms/weekly-progress-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingTestButton } from "@/components/ui/loading-test-button"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { useStudyStreak } from "@/hooks/use-study-streak"
import { TestStudyStreak } from "@/components/test-study-streak"
import { getTopicData } from "./topic-page"

interface UserProfile {
  interests: string[]
  studyGoals: any  // Can be object or array format
  learningPace: string
}

const defaultProfile: UserProfile = {
  interests: ["Technology", "Science", "Reading"],
  studyGoals: {
    subject: "mathematics",
    topic: "Algebra",
    focusArea: "Linear Equations"
  },
  learningPace: "steady"
}

export function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const { navigateToTab, navigateToUrl } = useUnifiedNavigation()
  const { currentStreak, getStreakStatus, todayCompletions, getWeeklyConsistency } = useStudyStreak()

  useEffect(() => {
    const profile = localStorage.getItem("user-profile")
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        // Merge with default profile to ensure all properties exist
        const mergedProfile = {
          ...defaultProfile,
          ...parsedProfile
        }
        setUserProfile(mergedProfile)
        // Save the merged profile back to localStorage
        localStorage.setItem("user-profile", JSON.stringify(mergedProfile))
      } catch (error) {
        console.error("Failed to parse user profile, using default:", error)
        // Save default profile to localStorage
        localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
      }
    } else {
      // Create default profile if none exists
      console.log("No user profile found, creating default profile")
      localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
    }
  }, [])

  // Comprehensive function to determine actual current study focus
  const getCurrentStudyFocus = () => {
    // Get available topics (you might want to make this dynamic based on user's enrolled topics)
    const availableTopics = ["college-algebra", "statistics", "biology", "anatomy"]
    
    // Get study streak data to find most recent activity
    const streakData = localStorage.getItem('study-streak-data')
    let recentCompletions: any[] = []
    
    if (streakData) {
      try {
        const parsedData = JSON.parse(streakData)
        recentCompletions = parsedData.completions || []
        // Sort by most recent
        recentCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      } catch (error) {
        console.error('Failed to parse study streak data:', error)
      }
    }
    
    // Find most recently active topic
    let mostRecentTopic = null
    if (recentCompletions.length > 0) {
      mostRecentTopic = recentCompletions[0].topicId
    }
    
    // Check each topic for current progress
    const topicProgress = availableTopics.map(topicId => {
      const topicData = getTopicData(topicId)
      
      // Calculate overall progress and find current section
      let totalConcepts = 0
      let completedConcepts = 0
      let currentSection = null
      let currentConcept = null
      
      // Find the first section with incomplete concepts (current section)
      for (const section of topicData.sections) {
        if (section.concepts && section.concepts.length > 0) {
          totalConcepts += section.concepts.length
          completedConcepts += section.concepts.filter(c => c.completed).length
          
          // If we haven't found a current section yet, check if this section has incomplete concepts
          if (!currentSection) {
            const firstIncomplete = section.concepts.find(c => !c.completed)
            if (firstIncomplete) {
              currentSection = section
              currentConcept = firstIncomplete
            }
          }
        }
      }
      
      const overallProgress = totalConcepts > 0 ? (completedConcepts / totalConcepts) * 100 : 0
      
      // Get subject mapping
      const subjectMap: Record<string, string> = {
        "college-algebra": "Mathematics",
        "statistics": "Mathematics", 
        "biology": "Science",
        "anatomy": "Science"
      }
      
      return {
        topicId,
        subject: subjectMap[topicId] || "Unknown",
        topic: topicData.title,
        currentSection,
        currentConcept,
        overallProgress,
        isRecentlyActive: topicId === mostRecentTopic,
        lastActivity: recentCompletions.find(c => c.topicId === topicId)?.completedAt || null
      }
    })
    
    // Filter to topics with actual progress or recent activity
    const activeTopics = topicProgress.filter(t => 
      t.overallProgress > 0 || t.isRecentlyActive || t.currentSection
    )
    
    if (activeTopics.length === 0) {
      // No progress yet, return default based on user preferences
      const studyFocus = getStudyFocusFromProfile()
      return studyFocus
    }
    
    // Prioritize topics:
    // 1. Most recently active topic with incomplete content
    // 2. Topic with lowest completion but some progress  
    // 3. Any topic with current section
    let prioritizedTopic = activeTopics.find(t => t.isRecentlyActive && t.currentSection)
    
    if (!prioritizedTopic) {
      // Find topic with progress but not completed
      const inProgressTopics = activeTopics.filter(t => t.overallProgress > 0 && t.overallProgress < 100)
      if (inProgressTopics.length > 0) {
        // Sort by lowest progress (most urgent)
        inProgressTopics.sort((a, b) => a.overallProgress - b.overallProgress)
        prioritizedTopic = inProgressTopics[0]
      }
    }
    
    if (!prioritizedTopic) {
      prioritizedTopic = activeTopics[0]
    }
    
    if (prioritizedTopic?.currentSection) {
      return {
        subject: prioritizedTopic.subject,
        topic: prioritizedTopic.topic,
        focusArea: prioritizedTopic.currentSection.title,
        progress: Math.round(prioritizedTopic.overallProgress),
        currentConcept: prioritizedTopic.currentConcept?.title || null
      }
    }
    
    // Fallback to profile-based focus
    return getStudyFocusFromProfile()
  }

  // Helper function to get study focus from user profile (fallback)
  const getStudyFocusFromProfile = () => {
    if (Array.isArray(userProfile.studyGoals)) {
      // New array format - use first goal
      const firstGoal = userProfile.studyGoals[0]
      return {
        subject: firstGoal?.subject || "mathematics",
        topic: firstGoal?.topic || "Algebra", 
        focusArea: "General concepts",
        progress: 0,
        currentConcept: null
      }
    } else if (userProfile.studyGoals && typeof userProfile.studyGoals === 'object') {
      // Old object format
      return {
        subject: userProfile.studyGoals.subject || "mathematics",
        topic: userProfile.studyGoals.topic || "Algebra",
        focusArea: userProfile.studyGoals.focusArea || "Linear Equations", 
        progress: 0,
        currentConcept: null
      }
    } else {
      // Fallback to default
      return {
        subject: "mathematics",
        topic: "Algebra",
        focusArea: "Linear Equations",
        progress: 0,
        currentConcept: null
      }
    }
  }

  const achievements = [
    { title: "Completed 7-day study streak", timeAgo: "Today", color: "#78af9f" },
    { title: "Mastered basic wave properties", timeAgo: "2 days ago", color: "#e5e7eb" },
    { title: "Connected guitar playing to sound waves", timeAgo: "1 week ago", color: "#d1d5db" },
  ]

  const weeklyData = [
    { day: "Monday", progress: 100 },
    { day: "Tuesday", progress: 80 },
    { day: "Wednesday", progress: 60 },
  ]

  const handleContinueLearning = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Get available topics (same as in getCurrentStudyFocus)
    const availableTopics = ["college-algebra", "statistics", "biology", "anatomy"]
    
    // Get study streak data to find most recent activity
    const streakData = localStorage.getItem('study-streak-data')
    let recentCompletions: any[] = []
    
    if (streakData) {
      try {
        const parsedData = JSON.parse(streakData)
        recentCompletions = parsedData.completions || []
        recentCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      } catch (error) {
        console.error('Failed to parse study streak data:', error)
      }
    }
    
    // Find the current topic and concept to continue with
    let targetTopicId = null
    let targetConceptId = null
    
    // First, try to find most recently active topic with incomplete content
    if (recentCompletions.length > 0) {
      const mostRecentTopic = recentCompletions[0].topicId
      if (availableTopics.includes(mostRecentTopic)) {
        const topicData = getTopicData(mostRecentTopic)
        
        // Find the first incomplete concept in this topic
        for (const section of topicData.sections) {
          if (section.concepts && section.concepts.length > 0) {
            const firstIncomplete = section.concepts.find(c => !c.completed)
            if (firstIncomplete) {
              targetTopicId = mostRecentTopic
              targetConceptId = firstIncomplete.id
              break
            }
          }
        }
      }
    }
    
    // If no recent topic or it's completed, find any topic with incomplete content
    if (!targetTopicId || !targetConceptId) {
      for (const topicId of availableTopics) {
        const topicData = getTopicData(topicId)
        
        for (const section of topicData.sections) {
          if (section.concepts && section.concepts.length > 0) {
            const firstIncomplete = section.concepts.find(c => !c.completed)
            if (firstIncomplete) {
              targetTopicId = topicId
              targetConceptId = firstIncomplete.id
              break
            }
          }
        }
        if (targetTopicId && targetConceptId) break
      }
    }
    
    // Navigate to the learning page
    if (targetTopicId && targetConceptId) {
      navigateToUrl(`/topic/${targetTopicId}/learn/${targetConceptId}`)
    } else {
      // Fallback to classes if no incomplete content found
      navigateToTab("classes")
    }
  }

  // Calculate current study focus
  const currentStudyFocus = getCurrentStudyFocus()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <PageHeader title="Dashboard" description="Track your learning progress and achievements" />
          <LoadingTestButton />
        </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="test-stats">Test Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsGrid
            studyStreak={currentStreak}
            weeklyConsistency={getWeeklyConsistency()}
            learningPace={userProfile.learningPace}
            streakStatus={getStreakStatus()}
            todayCompletions={todayCompletions}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <StudyFocusCard
              subject={currentStudyFocus.subject}
              topic={currentStudyFocus.topic}
              focusArea={currentStudyFocus.focusArea}
            />
            <InterestsCard interests={userProfile.interests} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto"
                  onClick={handleContinueLearning}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Continue Learning</p>
                      <p className="text-sm text-muted-foreground">
                        Resume {currentStudyFocus.topic} • {currentStudyFocus.focusArea}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <WeeklyProgressCard weeklyData={weeklyData} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsList achievements={achievements} />
        </TabsContent>

        <TabsContent value="test-stats" className="space-y-6">
          <TestStudyStreak />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
