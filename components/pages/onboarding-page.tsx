"use client"

import { useState } from "react"
import { OnboardingStep } from "@/components/organisms/onboarding-step"
import { InterestInput } from "@/components/molecules/interest-input"
import { PaceSelector } from "@/components/molecules/pace-selector"
import { InterestBadge } from "@/components/atoms/interest-badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { generateMockOnboardingData } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface OnboardingPageProps {
  onComplete: () => void
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [interests, setInterests] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [gradeLevel, setGradeLevel] = useState("")
  const [learningPace, setLearningPace] = useState("")

  const steps = ["Interests & Hobbies", "Study Topics", "Grade Level", "Learning Pace"]

  const availableTopics = [
    "College Algebra",
    "Statistics", 
    "Writing",
    "Philosophy",
    "World History",
    "Biology",
    "Anatomy"
  ]

  const gradeLevels = [
    { value: "middle", label: "Middle School", description: "Grades 6-8" },
    { value: "high", label: "High School", description: "Grades 9-12" },
    { value: "college", label: "College", description: "Undergraduate level" },
    { value: "graduate", label: "Graduate", description: "Masters/PhD level" }
  ]

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest])
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const onboardingData = {
        interests,
        selectedTopics,
        gradeLevel,
        learningPace,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem("user-profile", JSON.stringify(onboardingData))
      }
      onComplete()
    }
  }

  const handleSkip = () => {
    const mockData = generateMockOnboardingData()
    if (typeof window !== 'undefined') {
      localStorage.setItem("user-profile", JSON.stringify(mockData))
    }
    onComplete()
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return interests.length > 0
      case 1:
        return selectedTopics.length > 0
      case 2:
        return gradeLevel !== ""
      case 3:
        return learningPace !== ""
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <InterestInput onAdd={addInterest} placeholder="e.g., baking, guitar, video games" />
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <InterestBadge key={interest} interest={interest} onRemove={removeInterest} />
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the topics you'd like to study. You can choose multiple areas.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {availableTopics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopics.includes(topic) ? "default" : "outline"}
                  onClick={() => toggleTopic(topic)}
                  className={cn(
                    "h-auto p-4 text-left justify-start transition-all",
                    selectedTopics.includes(topic) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 transition-colors",
                      selectedTopics.includes(topic) 
                        ? "bg-primary-foreground border-primary-foreground" 
                        : "border-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{topic}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>What's your current grade level?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us tailor the difficulty and explanations to your level.
              </p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                {gradeLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={gradeLevel === level.value ? "default" : "outline"}
                    onClick={() => setGradeLevel(level.value)}
                    className={cn(
                      "h-auto p-4 text-left justify-start transition-all",
                      gradeLevel === level.value 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 transition-colors",
                        gradeLevel === level.value 
                          ? "bg-primary-foreground border-primary-foreground" 
                          : "border-muted-foreground"
                      )} />
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm opacity-70">{level.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Choose your learning pace</Label>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {[
                  {
                    value: "turtle",
                    label: "Turtle",
                    description: "2 questions per day - Take it slow and steady",
                  },
                  {
                    value: "steady",
                    label: "Steady",
                    description: "3-4 questions per day - Balanced approach",
                  },
                  {
                    value: "rabbit",
                    label: "Fast",
                    description: "5-6 questions per day - Fast-paced learning",
                  },
                ].map((pace) => (
                  <PaceSelector
                    key={pace.value}
                    value={pace.value}
                    label={pace.label}
                    description={pace.description}
                    isSelected={learningPace === pace.value}
                    onSelect={setLearningPace}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <OnboardingStep
      title="Welcome to Spool"
      description={steps[currentStep]}
      currentStep={currentStep}
      totalSteps={steps.length}
      canProceed={canProceed()}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
    >
      {renderStepContent()}
    </OnboardingStep>
  )
}
