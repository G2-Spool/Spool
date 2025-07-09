"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ForceGraph, generateAcademicNetwork, generateHobbyNetwork } from "@/components/ui/force-graph"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft, BookOpen, Zap, Heart, Brain } from "lucide-react"

interface SplashScreenPageProps {
  onComplete: () => void
}

export function SplashScreenPage({ onComplete }: SplashScreenPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [academicNetwork] = useState(() => generateAcademicNetwork())
  const [hobbyNetwork] = useState(() => generateHobbyNetwork())

  // Animation states for graphs
  const [showAcademicGraph, setShowAcademicGraph] = useState(false)
  const [showHobbyGraph, setShowHobbyGraph] = useState(false)
  const [graphPosition, setGraphPosition] = useState<'center' | 'left' | 'combined'>('center')

  const steps = [
    {
      id: 'struggles',
      title: "Learning Feels Like a Struggle?",
      subtitle: "You're not alone - traditional education often feels disconnected",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Endless memorization, boring lectures, and concepts that feel irrelevant to your life?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Curriculum feels disconnected from real life</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Hard to stay motivated and engaged</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Academic pressure without personal meaning</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rigors',
      title: "The Rigors of Academia",
      subtitle: "Complex subjects all interconnected, demanding your attention",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Math connects to Physics, History to Economics, Biology to Chemistry...
            </p>
            <p className="text-sm text-muted-foreground">
              An overwhelming web of knowledge that feels impossible to navigate.
            </p>
          </div>
          
          {/* Academic Graph Container */}
          <div className="flex justify-center items-center min-h-[200px]">
            <div 
              className={cn(
                "transition-all duration-1000 ease-out",
                graphPosition === 'center' ? 'translate-x-0' : 'translate-x-[-100px]'
              )}
            >
              {showAcademicGraph && (
                <ForceGraph 
                  nodes={academicNetwork.nodes}
                  links={academicNetwork.links}
                  nodeColor="#f97316"
                  width={200}
                  height={200}
                  animate={true}
                />
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hobbies',
      title: "What If You Could Focus on Your Hobbies?",
      subtitle: "Learning through what you already love and enjoy",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              What if physics came through guitar strings? Math through game design? History through your favorite stories?
            </p>
          </div>
          
          {/* Dual Graph Container */}
          <div className="flex justify-center items-center min-h-[200px] relative overflow-hidden">
            {/* Academic Graph - moves left */}
            <div 
              className={cn(
                "absolute transition-all duration-1000 ease-out",
                graphPosition === 'left' ? 'translate-x-[-100px]' : 'translate-x-0'
              )}
            >
              {showAcademicGraph && (
                <ForceGraph 
                  nodes={academicNetwork.nodes}
                  links={academicNetwork.links}
                  nodeColor="#f97316"
                  width={200}
                  height={200}
                  animate={false}
                />
              )}
            </div>
            
            {/* Hobby Graph - slides in from right */}
            <div 
              className={cn(
                "absolute transition-all duration-1000 ease-out",
                showHobbyGraph ? 'translate-x-[100px]' : 'translate-x-[300px]'
              )}
            >
              {showHobbyGraph && (
                <ForceGraph 
                  nodes={hobbyNetwork.nodes}
                  links={hobbyNetwork.links}
                  nodeColor="hsl(var(--primary))"
                  width={200}
                  height={200}
                  animate={true}
                />
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: "Where Learning Comes Alive",
      subtitle: "AI-powered education that bridges your passions with academic excellence",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your interests and academics, perfectly connected. Learning that feels personal, meaningful, and exciting.
            </p>
          </div>
          
          {/* Combined Graph Container */}
          <div className="flex justify-center items-center min-h-[200px]">
            <div 
              className={cn(
                "transition-all duration-1000 ease-out",
                graphPosition === 'combined' ? 'scale-110' : 'scale-100'
              )}
            >
              {graphPosition === 'combined' && (
                <ForceGraph 
                  nodes={[...academicNetwork.nodes, ...hobbyNetwork.nodes]}
                  links={[
                    ...academicNetwork.links, 
                    ...hobbyNetwork.links,
                    // Bridge connections
                    { source: 'math', target: 'gaming' },
                    { source: 'physics', target: 'guitar' },
                    { source: 'chemistry', target: 'cooking' },
                    { source: 'history', target: 'reading' },
                    { source: 'biology', target: 'sports' },
                    { source: 'english', target: 'art' }
                  ]}
                  nodeColor={`hsl(var(--primary))`}
                  width={250}
                  height={250}
                  animate={true}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border border-primary/20 text-center">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-xs text-muted-foreground">Connected Paths</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-500">AI</div>
              <div className="text-xs text-muted-foreground">Powered</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  // Handle step transitions with graph animations
  useEffect(() => {
    if (currentStep === 1) {
      // Show academic graph on rigors page
      setTimeout(() => setShowAcademicGraph(true), 300)
    } else if (currentStep === 2) {
      // Move academic graph left and show hobby graph
      setTimeout(() => setGraphPosition('left'), 300)
      setTimeout(() => setShowHobbyGraph(true), 600)
    } else if (currentStep === 3) {
      // Combine graphs
      setTimeout(() => setGraphPosition('combined'), 300)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 150)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          {/* Progress indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    index === currentStep
                      ? "bg-primary w-6"
                      : index < currentStep
                      ? "bg-primary/60"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content with enhanced animations */}
          <div className="overflow-hidden">
            <div
              className={cn(
                "transition-all duration-700 ease-out",
                currentStep === 3 ? "transform translate-y-4" : "",
                isTransitioning ? "opacity-50" : "opacity-100"
              )}
            >
              {/* Header */}
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentStepData.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentStepData.subtitle}
                </p>
              </div>

              {/* Content */}
              <div className="min-h-[350px] flex flex-col justify-center">
                {currentStepData.content}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {/* Back button - only show if not on first step */}
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                size="lg"
                className="group transition-all duration-300"
                disabled={isTransitioning}
              >
                <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            )}
            
            {/* Next/Try Now button */}
            <Button
              onClick={handleNext}
              size="lg"
              className="flex-1 group transition-all duration-300 hover:shadow-lg"
              disabled={isTransitioning}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Start Learning!
                  <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 