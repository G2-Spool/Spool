"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, BookOpen } from "lucide-react"
import { ConceptItem } from "./types"
import { ModuleRenderer } from "./module-renderer"

interface LearningContentProps {
  concept: ConceptItem
  onAssignmentComplete?: (assignmentId: string, response: string) => void
  onAssignmentUpdateResponse?: (assignmentId: string, response: string) => void
}

export function LearningContent({ 
  concept, 
  onAssignmentComplete, 
  onAssignmentUpdateResponse 
}: LearningContentProps) {
  const getStatusBadge = () => {
    if (concept.completed) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      )
    } else if (concept.progress > 0) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        <BookOpen className="h-3 w-3 mr-1" />
        Not Started
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Concept Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{concept.title}</CardTitle>
              {concept.description && (
                <p className="text-base text-muted-foreground mt-2">{concept.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge()}
              {!concept.completed && concept.progress > 0 && (
                <div className="w-24">
                  <Progress value={concept.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {concept.progress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Concept Content Modules */}
      <div className="space-y-4">
        {concept.modules.length > 0 ? (
          concept.modules
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <ModuleRenderer 
                key={module.id} 
                module={module}
                onAssignmentComplete={onAssignmentComplete}
                onAssignmentUpdateResponse={onAssignmentUpdateResponse}
              />
            ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                <p className="text-muted-foreground">
                  This concept doesn't have any learning modules yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 