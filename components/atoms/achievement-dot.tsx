"use client"

interface AchievementDotProps {
  color?: string
}

export function AchievementDot({ color = "#78af9f" }: AchievementDotProps) {
  return <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
}
