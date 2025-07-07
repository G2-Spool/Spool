"use client"

import { StatCard } from "@/components/atoms/stat-card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Target, TrendingUp } from "lucide-react"

interface StatsGridProps {
  studyStreak: number
  todayProgress: number
  weeklyGoal: number
  learningPace: string
}

export function StatsGrid({ studyStreak, todayProgress, weeklyGoal, learningPace }: StatsGridProps) {
  const getPaceDescription = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "2 questions/day"
      case "steady":
        return "3-4 questions/day"
      case "rabbit":
        return "5-6 questions/day"
      default:
        return "Custom pace"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Study Streak" value={`${studyStreak} days`} description="Keep it up!" icon={Calendar} />

      <StatCard title="Today's Progress" value={`${todayProgress}%`} icon={Clock}>
        <Progress value={todayProgress} className="mt-2" />
      </StatCard>

      <StatCard title="Weekly Goal" value={`${weeklyGoal}%`} description="5/7 days completed" icon={Target} />

      <StatCard
        title="Learning Pace"
        value={learningPace}
        description={getPaceDescription(learningPace)}
        icon={TrendingUp}
      />
    </div>
  )
}
