"use client"

import { useState } from "react"
import { FileText, CheckCircle, Circle, Lock, ChevronDown, ChevronUp } from "lucide-react"
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

interface SectionWindow {
  overview: Section
  recentlyCompleted: Section | null
  current: Section | null
  upcoming: Section[]
}

export function SectionNavigation({ sections, activeSection, onSectionChange }: SectionNavigationProps) {
  const [showAll, setShowAll] = useState(false)
  
  const getSectionProgress = (section: Section) => {
    if (!section.concepts || section.concepts.length === 0) {
      return section.id === "overview" ? 100 : 0
    }
    
    const totalProgress = section.concepts.reduce((sum, concept) => sum + concept.progress, 0)
    return Math.round(totalProgress / section.concepts.length)
  }

  const calculateSectionWindow = (sections: Section[]): SectionWindow => {
    // Find overview section (always show)
    const overview = sections.find(s => s.id === "overview")!
    
    // Get all non-overview sections
    const nonOverviewSections = sections.filter(s => s.id !== "overview")
    
    // Find the first incomplete section (current)
    const currentIndex = nonOverviewSections.findIndex(section => 
      getSectionProgress(section) < 100
    )
    
    // If all sections are complete, show the last few sections
    if (currentIndex === -1) {
      const lastSections = nonOverviewSections.slice(-9)
      return {
        overview,
        recentlyCompleted: lastSections[lastSections.length - 2] || null,
        current: lastSections[lastSections.length - 1] || null,
        upcoming: []
      }
    }
    
    // Normal case: show recently completed + current + upcoming
    return {
      overview,
      recentlyCompleted: currentIndex > 0 ? nonOverviewSections[currentIndex - 1] : null,
      current: nonOverviewSections[currentIndex],
      upcoming: nonOverviewSections.slice(currentIndex + 1, currentIndex + 9)
    }
  }

  const getSectionState = (section: Section, window: SectionWindow) => {
    if (section.id === "overview") return "overview"
    
    // When showing all sections, determine state based on progress
    if (showAll) {
      const progress = getSectionProgress(section)
      if (progress === 100) return "completed"
      if (progress > 0) return "current"
      return "upcoming"
    }
    
    // When showing windowed view, use window logic
    if (section === window.recentlyCompleted) return "completed"
    if (section === window.current) return "current"
    if (window.upcoming.includes(section)) return "upcoming"
    return "hidden"
  }

  const sectionWindow = calculateSectionWindow(sections)
  const totalSections = sections.length
  const currentSectionIndex = sections.findIndex(s => s === sectionWindow.current) || 0

  // Get sections to display based on showAll state
  const windowedSections = [
    sectionWindow.overview,
    sectionWindow.recentlyCompleted,
    sectionWindow.current,
    ...sectionWindow.upcoming
  ].filter(Boolean) as Section[]
  
  const sectionsToShow = showAll ? sections : windowedSections
  
  // Determine if we need Show All functionality
  const hasMoreSections = totalSections > windowedSections.length
  const sectionsAhead = totalSections - windowedSections.length

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Course Sections</h3>
          </div>
          {hasMoreSections && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs h-8 px-2 py-1"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Minimize
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          )}
        </div>
        {/* Progress Context */}
        <div className="text-sm text-muted-foreground">
          {sectionWindow.current ? (
            <>Section {currentSectionIndex + 1} of {totalSections}</>
          ) : (
            <>Course Complete ({totalSections} sections)</>
          )}
        </div>
      </div>
      
      <div className="p-2">
        {sectionsToShow.map((section) => {
          const progress = getSectionProgress(section)
          const isActive = activeSection === section.id
          const sectionState = getSectionState(section, sectionWindow)
          
          return (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "w-full justify-start p-4 mb-2 text-left min-h-[80px] border-2 border-transparent transition-all duration-200",
                isActive && "border-primary",
                sectionState === "completed" && "opacity-60 hover:opacity-80",
                (sectionState === "current" || section === sectionWindow.current) && "ring-2 ring-primary/20 bg-primary/5",
                sectionState === "upcoming" && "opacity-80"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <div className="flex items-start gap-3 w-full max-w-full">
                <div className="flex-shrink-0 mt-2" style={{ width: '36px', minWidth: '36px' }}>
                  {sectionState === "completed" && progress === 100 ? (
                    <CheckCircle className="h-9 w-9 text-green-500" />
                  ) : sectionState === "upcoming" && progress === 0 && section !== sectionWindow.current ? (
                    <Circle className="h-9 w-9 text-muted-foreground" />
                  ) : (
                    <ProgressRing 
                      progress={progress} 
                      size={36} 
                      isSelected={isActive}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0" style={{ width: 'calc(100% - 48px)' }}>
                  <div className={cn(
                    "font-medium mb-1 leading-tight",
                    section.id === "overview" ? "text-lg" : "text-base",
                    (sectionState === "current" || section === sectionWindow.current) && "text-primary"
                  )}>
                    {section.title}
                    {section === sectionWindow.current && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                    {sectionState === "completed" && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Complete
                      </span>
                    )}
                  </div>
                  {section.description && (
                    <div 
                      className={cn(
                        "text-muted-foreground leading-tight overflow-hidden",
                        section.id === "overview" ? "text-base" : "text-sm"
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
        
        {/* Show indicator if there are more sections (only in windowed view) */}
        {!showAll && sectionsAhead > 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 mx-auto mb-2" />
            {sectionsAhead} more section{sectionsAhead === 1 ? '' : 's'} ahead
          </div>
        )}
      </div>
    </div>
  )
} 