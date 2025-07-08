"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft, BookOpen, Zap, TrendingUp, Heart, Brain, Target } from "lucide-react"

interface SplashScreenPageProps {
  onComplete: () => void
}

export function SplashScreenPage({ onComplete }: SplashScreenPageProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Learning Feels Disconnected?",
      subtitle: "Traditional studying often feels boring and irrelevant",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Does studying physics feel like memorizing formulas? Does history seem like endless dates to remember?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Curriculum feels disconnected from your passions</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Hard to see real-world applications</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Motivation drops over time</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI-Powered Personalized Learning",
      subtitle: "Connect your interests with academic subjects through AI",
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Love guitar? Learn sound waves through pickup design. Into gaming? Explore physics through game mechanics.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm">Tailored content based on your hobbies</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm">AI adapts to your learning style</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm">Real-world applications you actually care about</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Learning Journey Awaits",
      subtitle: "Daily modules, visual maps, and personalized growth",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Set your pace, track progress, and watch your knowledge grow through interactive learning experiences.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-500">2-6</div>
              <div className="text-xs text-muted-foreground">Daily Questions</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-500">∞</div>
              <div className="text-xs text-muted-foreground">Learning Paths</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 text-center">
              <div className="text-2xl font-bold text-purple-500">AI</div>
              <div className="text-xs text-muted-foreground">Personalized</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 text-center">
              <div className="text-2xl font-bold text-orange-500">📈</div>
              <div className="text-xs text-muted-foreground">Visual Progress</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
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

          {/* Content with slide animation */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentStep * (100 / steps.length)}%)`,
                width: `${steps.length * 100}%`
              }}
            >
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 space-y-6"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {step.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="min-h-[300px] flex flex-col justify-center">
                    {step.content}
                  </div>
                </div>
              ))}
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
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Try Now!
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