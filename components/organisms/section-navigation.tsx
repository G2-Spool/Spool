"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/atoms/progress-ring"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  title: string
  description?: string
  concepts?: Concept[]
  content?: string
}

interface Concept {
  id: string
  title: string
  description: string
  completed: boolean
  locked: boolean
  progress: number
}

interface SectionNavigationProps {
  sections: Section[]
  activeSection: string
  onSectionChange: (sectionId: string) => void
}

export function SectionNavigation({ sections, activeSection, onSectionChange }: SectionNavigationProps) {
  const getSectionProgress = (section: Section) => {
    if (!section.concepts || section.concepts.length === 0) {
      return section.id === "overview" ? 100 : 0
    }
    
    const totalProgress = section.concepts.reduce((sum, concept) => sum + concept.progress, 0)
    return Math.round(totalProgress / section.concepts.length)
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Course Sections</h3>
        </div>
      </div>
      
      <div className="p-2">
        {sections.map((section) => {
          const progress = getSectionProgress(section)
          const isActive = activeSection === section.id
          const isOverview = section.id === "overview"
          
          return (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "w-full justify-start p-4 mb-2 text-left min-h-[80px] border-2 border-transparent",
                isActive && "border-primary"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <div className="flex items-start gap-3 w-full max-w-full">
                <div className="flex-shrink-0 mt-2" style={{ width: '36px', minWidth: '36px' }}>
                  <ProgressRing 
                    progress={progress} 
                    size={36} 
                    isSelected={isActive}
                  />
                </div>
                <div className="flex-1 min-w-0" style={{ width: 'calc(100% - 48px)' }}>
                  <div className={cn(
                    "font-medium mb-1 leading-tight",
                    isOverview ? "text-lg" : "text-base"
                  )}>
                    {section.title}
                  </div>
                  {section.description && (
                    <div 
                      className={cn(
                        "text-muted-foreground leading-tight overflow-hidden",
                        isOverview ? "text-base" : "text-sm"
                      )}
                      style={{
                        height: '2.5em',
                        lineHeight: '1.25em',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                    >
                      {section.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
} 