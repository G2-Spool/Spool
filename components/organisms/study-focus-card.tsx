"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface StudyFocusCardProps {
  subject: string
  topic: string
  focusArea: string
}

export function StudyFocusCard({ subject, topic, focusArea }: StudyFocusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <BookOpen className="h-5 w-5" />
          <span>Current Study Focus</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-300">Subject</div>
          <div className="text-lg capitalize text-white">{subject}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-300">Topic</div>
          <div className="text-lg text-white">{topic}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-300">Focus Area</div>
          <div className="text-lg text-white">{focusArea}</div>
        </div>
      </CardContent>
    </Card>
  )
}
