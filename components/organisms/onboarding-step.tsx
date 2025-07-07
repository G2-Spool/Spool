"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface OnboardingStepProps {
  title: string
  description: string
  currentStep: number
  totalSteps: number
  canProceed: boolean
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  children: React.ReactNode
}

export function OnboardingStep({
  title,
  description,
  currentStep,
  totalSteps,
  canProceed,
  onNext,
  onBack,
  onSkip,
  children,
}: OnboardingStepProps) {
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {totalSteps}: {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</div>
              <ModeToggle />
            </div>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {onSkip && (
                <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                  Skip & Use Demo Data
                </Button>
              )}
            </div>
            <Button onClick={onNext} disabled={!canProceed}>
              {isLastStep ? "Complete Setup" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
