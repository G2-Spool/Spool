"use client"

import React from "react"
import { CheckCircle, Lock, Circle, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ConceptItem } from "./types"

interface ConceptSidebarProps {
  concepts: ConceptItem[]
  currentConceptId: string
  onConceptSelect: (conceptId: string) => void
  onBack?: () => void
  className?: string
}

export function ConceptSidebar({ 
  concepts, 
  currentConceptId, 
  onConceptSelect,
  onBack,
  className = ""
}: ConceptSidebarProps) {
  const getStatusIcon = (concept: ConceptItem) => {
    if (concept.completed) {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-white" style={{ width: '11px', height: '11px' }} />
        </div>
      )
    } else if (concept.locked) {
      return <Lock className="h-4 w-4 text-gray-400" />
    } else {
      return <Circle className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (concept: ConceptItem) => {
    if (concept.completed) return "text-green-700"
    if (concept.locked) return "text-gray-400"
    return "text-foreground"
  }

  const getStatusBadge = (concept: ConceptItem) => {
    if (concept.completed) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>
    } else if (concept.locked) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Locked</Badge>
    } else if (concept.progress > 0) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
    }
    return null
  }

  return (
    <Card className={`sticky top-4 h-fit ${className}`}>
      <CardHeader className="pb-3 pl-2 pr-2">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground mb-4 justify-start p-2 -ml-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Section
          </Button>
        )}
        <CardTitle className="text-lg font-semibold">Course Concepts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pl-2 pr-2">
        {concepts.map((concept) => (
          <div key={concept.id} className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => !concept.locked && onConceptSelect(concept.id)}
              disabled={concept.locked}
              className={`w-full justify-start p-3 h-auto text-left min-w-0 ${
                concept.locked ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                currentConceptId === concept.id ? 'border-2 border-primary bg-primary/10 hover:bg-muted/100' : 'border-2 border-transparent hover:bg-muted/100'
              }`}
            >
              <div className="flex items-center space-x-3 w-full">
                {getStatusIcon(concept)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium text-sm ${getStatusColor(concept)} truncate pr-2`}>
                      {concept.title}
                    </h4>
                    {currentConceptId === concept.id && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                  </div>
                  {concept.description && (
                    <div 
                      className="text-xs text-muted-foreground mt-1 leading-tight overflow-hidden"
                      style={{
                        height: '2.5em',
                        lineHeight: '1.25em',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                    >
                      {concept.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
            
            {/* Progress bar for current concept */}
            {currentConceptId === concept.id && !concept.completed && concept.progress > 0 && (
              <div className="px-3 pb-2">
                <Progress value={concept.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {concept.progress}% complete
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 