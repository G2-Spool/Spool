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
  const [todayProgress] = useState(60)
  const [weeklyGoal] = useState(75)
  const { navigateToTab } = useUnifiedNavigation()
  const { currentStreak, getStreakStatus } = useStudyStreak()

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
    navigateToTab("classes")
  }

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
          <TabsTrigger value="test-streak">Test Streak</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsGrid
            studyStreak={currentStreak}
            todayProgress={todayProgress}
            weeklyGoal={weeklyGoal}
            learningPace={userProfile.learningPace}
            streakStatus={getStreakStatus()}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <StudyFocusCard
              subject={userProfile.studyGoals.subject}
              topic={userProfile.studyGoals.topic}
              focusArea={userProfile.studyGoals.focusArea}
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
                  onClick={handleGoToClasses}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Go to Classes</p>
                      <p className="text-sm text-muted-foreground">Browse and study your courses</p>
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

        <TabsContent value="test-streak" className="space-y-6">
          <TestStudyStreak />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
