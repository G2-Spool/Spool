"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressRow } from "@/components/molecules/progress-row"
import { BarChart3 } from "lucide-react"

interface WeeklyProgressCardProps {
  weeklyData: Array<{ day: string; progress: number }>
}

export function WeeklyProgressCard({ weeklyData }: WeeklyProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <BarChart3 className="h-5 w-5" />
          <span>Weekly Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyData.map((day) => (
            <ProgressRow key={day.day} label={day.day} value={day.progress} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
