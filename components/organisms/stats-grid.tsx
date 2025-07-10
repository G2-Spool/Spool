"use client"

import { StatCard } from "@/components/atoms/stat-card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Target, TrendingUp } from "lucide-react"

interface StatsGridProps {
  studyStreak: number
  weeklyGoal: number
  learningPace: string
  streakStatus?: { message: string; isActive: boolean }
  todayCompletions: number
}

export function StatsGrid({ studyStreak, weeklyGoal, learningPace, streakStatus, todayCompletions }: StatsGridProps) {
  const getPaceDescription = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "2 concepts/day"
      case "steady":
        return "5 concepts/day"
      case "rabbit":
        return "8 concepts/day"
      default:
        return "Custom pace"
    }
  }

  const getPaceDisplayName = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "Calm"
      case "steady":
        return "Steady"
      case "rabbit":
        return "Energized"
      default:
        return pace
    }
  }

  const getDailyGoal = (pace: string): number => {
    switch (pace) {
      case "turtle":
        return 2
      case "steady":
        return 5
      case "rabbit":
        return 8
      default:
        return 3
    }
  }

  const dailyGoal = getDailyGoal(learningPace)
  const dailyProgress = Math.min(100, Math.round((todayCompletions / dailyGoal) * 100))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Study Streak" 
        value={`${studyStreak} days`} 
        description={streakStatus?.message || "Keep it up!"} 
        icon={Calendar} 
      />

      <StatCard title="Today's Progress" value={`${dailyProgress}%`} description={`${todayCompletions}/${dailyGoal} concepts`} icon={Clock}>
        <Progress value={dailyProgress} className="mt-2" />
      </StatCard>

      <StatCard title="Weekly Goal" value={`${weeklyGoal}%`} description="5/7 days completed" icon={Target} />

      <StatCard
        title="Learning Pace"
        value={getPaceDisplayName(learningPace)}
        description={getPaceDescription(learningPace)}
        icon={TrendingUp}
      />
    </div>
  )
}
