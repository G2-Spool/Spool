"use client"

import { Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressCircle } from "@/components/atoms/progress-circle"
import { cn } from "@/lib/utils"

interface Concept {
  id: string
  title: string
  description: string
  completed: boolean
  locked: boolean
  progress: number
}

interface ConceptListProps {
  concepts: Concept[]
  onConceptClick: (conceptId: string) => void
}

export function ConceptList({ concepts, onConceptClick }: ConceptListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Concepts</h3>
      
      <div className="space-y-2">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className={cn(
              "transition-all duration-200 cursor-pointer hover:shadow-md",
              concept.locked && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !concept.locked && onConceptClick(concept.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {concept.completed ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : concept.locked ? (
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm mb-1",
                    concept.locked && "text-gray-400"
                  )}>
                    {concept.title}
                  </h4>
                  <p className={cn(
                    "text-xs text-muted-foreground",
                    concept.locked && "text-gray-400"
                  )}>
                    {concept.description}
                  </p>
                </div>

                {/* Progress Circle */}
                <div className="flex-shrink-0">
                  {!concept.locked && (
                    <ProgressCircle
                      progress={concept.progress}
                      size={32}
                      onClick={() => onConceptClick(concept.id)}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 