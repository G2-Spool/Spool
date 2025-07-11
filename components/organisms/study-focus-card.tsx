"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { ClassBadge } from "@/components/atoms/class-badge"

interface ClassItem {
  id: string
  title: string
  color: string
  subject: string
}

interface StudyFocusCardProps {
  classes: ClassItem[]
  onClassClick?: (classId: string) => void
}

export function StudyFocusCard({ classes, onClassClick }: StudyFocusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <BookOpen className="h-5 w-5" />
          <span>Current Classes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {classes.map((classItem) => (
            <ClassBadge
              key={classItem.id}
              className={classItem.title}
              subject={classItem.subject}
              color={classItem.color}
              size="large"
              onClick={() => onClassClick?.(classItem.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
