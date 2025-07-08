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
import { useRouter } from "next/navigation"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"
import { useLoading } from "@/contexts/loading-context"

interface UserProfile {
  interests: string[]
  studyGoals: {
    subject: string
    topic: string
    focusArea: string
  }
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
  const [studyStreak] = useState(7)
  const [todayProgress] = useState(60)
  const [weeklyGoal] = useState(75)
  const router = useRouter()
  const { navigateWithLoading } = useNavigationLoading()
  const { startLoading, stopLoading } = useLoading()

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

  const handleGoToClasses = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Show loading screen before navigation
    startLoading()
    
    // Navigate to the classes tab
    router.push("/?tab=classes")
    
    // Small delay to show loading animation
    setTimeout(() => {
      stopLoading()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <PageHeader title="Dashboard" description="Track your learning progress and achievements" />
          <LoadingTestButton />
        </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsGrid
            studyStreak={studyStreak}
            todayProgress={todayProgress}
            weeklyGoal={weeklyGoal}
            learningPace={userProfile.learningPace}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <StudyFocusCard
              subject={userProfile.studyGoals.subject}
              topic={userProfile.studyGoals.topic}
              focusArea={userProfile.studyGoals.focusArea}
            />
            <InterestsCard interests={userProfile.interests} />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <WeeklyProgressCard weeklyData={weeklyData} />
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Total Study Time</span>
                  <span className="font-medium text-white">24h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Questions Answered</span>
                  <span className="font-medium text-white">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Accuracy Rate</span>
                  <span className="font-medium text-white">78%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsList achievements={achievements} />
        </TabsContent>
      </Tabs>
      
      {/* Go to Classes button under the cards */}
      <div className="flex justify-end mt-4">
        <Button 
          size="lg"
          className="px-6 py-3 text-lg"
          onClick={handleGoToClasses}
        >
          Go to Classes
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      </div>
    </div>
  )
}
