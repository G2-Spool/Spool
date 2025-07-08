"use client"

import React from "react"
import { LearningModule } from "./types"
import { TextModuleComponent } from "./text-module"
import { QuoteModuleComponent } from "./quote-module"
import { LatexModuleComponent } from "./latex-module"
import { DiagramModuleComponent } from "./diagram-module"
import { YouTubeModuleComponent } from "./youtube-module"
import { AssignmentModuleComponent } from "./assignment-module"

interface ModuleRendererProps {
  module: LearningModule
  onAssignmentComplete?: (assignmentId: string, response: string) => void
  onAssignmentUpdateResponse?: (assignmentId: string, response: string) => void
}

export function ModuleRenderer({ 
  module, 
  onAssignmentComplete, 
  onAssignmentUpdateResponse 
}: ModuleRendererProps) {
  switch (module.type) {
    case 'text':
      return <TextModuleComponent module={module} />
    
    case 'quote':
      return <QuoteModuleComponent module={module} />
    
    case 'latex':
      return <LatexModuleComponent module={module} />
    
    case 'diagram':
      return <DiagramModuleComponent module={module} />
    
    case 'youtube':
      return <YouTubeModuleComponent module={module} />
    
    case 'assignment':
      return (
        <AssignmentModuleComponent 
          module={module}
          onComplete={onAssignmentComplete}
          onUpdateResponse={onAssignmentUpdateResponse}
        />
      )
    
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            Unknown module type: {(module as any).type}
          </p>
        </div>
      )
  }
} 