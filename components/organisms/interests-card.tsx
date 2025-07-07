"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InterestBadge } from "@/components/atoms/interest-badge"

interface InterestsCardProps {
  interests: string[]
  title?: string
  description?: string
}

export function InterestsCard({
  interests,
  title = "Your Interests",
  description = "We'll connect these to your studies to make learning more engaging",
}: InterestsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <InterestBadge key={interest} interest={interest} variant="secondary" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
