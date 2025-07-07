"use client"

import { Badge } from "@/components/ui/badge"
import { AchievementDot } from "@/components/atoms/achievement-dot"

interface AchievementItemProps {
  title: string
  timeAgo: string
  color?: string
}

export function AchievementItem({ title, timeAgo, color }: AchievementItemProps) {
  return (
    <div className="flex items-center space-x-3">
      <AchievementDot color={color} />
      <span className="text-sm text-gray-300">{title}</span>
      <Badge variant="outline" className="ml-auto">
        {timeAgo}
      </Badge>
    </div>
  )
}
