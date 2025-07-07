"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AchievementItem } from "@/components/molecules/achievement-item"
import { Award } from "lucide-react"

interface Achievement {
  title: string
  timeAgo: string
  color?: string
}

interface AchievementsListProps {
  achievements: Achievement[]
  title?: string
}

export function AchievementsList({ achievements, title = "Recent Achievements" }: AchievementsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Award className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <AchievementItem
              key={index}
              title={achievement.title}
              timeAgo={achievement.timeAgo}
              color={achievement.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
