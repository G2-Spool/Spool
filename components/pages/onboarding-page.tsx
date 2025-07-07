"use client"

import { useState } from "react"
import { OnboardingStep } from "@/components/organisms/onboarding-step"
import { InterestInput } from "@/components/molecules/interest-input"
import { StudyGoalField } from "@/components/molecules/study-goal-field"
import { PaceSelector } from "@/components/molecules/pace-selector"
import { InterestBadge } from "@/components/atoms/interest-badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OnboardingPageProps {
  onComplete: () => void
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [interests, setInterests] = useState<string[]>([])
  const [interestDetails, setInterestDetails] = useState<Record<string, string>>({})
  const [studyGoals, setStudyGoals] = useState({
    subject: "",
    topic: "",
    focusArea: "",
  })
  const [competencyAnswers, setCompetencyAnswers] = useState<string[]>([])
  const [learningPace, setLearningPace] = useState("")

  const steps = ["Interests & Hobbies", "Interest Details", "Study Goals", "Competency Assessment", "Learning Pace"]

  const addInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest])
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
    const newDetails = { ...interestDetails }
    delete newDetails[interest]
    setInterestDetails(newDetails)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const onboardingData = {
        interests,
        interestDetails,
        studyGoals,
        competencyAnswers,
        learningPace,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem("user-profile", JSON.stringify(onboardingData))
      }
      onComplete()
    }
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
        return interests.every((interest) => !!interestDetails[interest]?.trim())
      case 2:
        return !!(studyGoals.subject && studyGoals.topic && studyGoals.focusArea)
      case 3:
        return competencyAnswers.length > 0 && competencyAnswers.every((answer) => !!answer.trim())
      case 4:
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
              Tell us more about your interests to help personalize your learning experience.
            </p>
            {interests.map((interest) => (
              <div key={interest} className="space-y-2">
                <Label htmlFor={`detail-${interest}`}>What do you enjoy most about {interest}?</Label>
                <Textarea
                  id={`detail-${interest}`}
                  value={interestDetails[interest] || ""}
                  onChange={(e) =>
                    setInterestDetails({
                      ...interestDetails,
                      [interest]: e.target.value,
                    })
                  }
                  placeholder={`Describe what you love about ${interest}...`}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={studyGoals.subject}
                onValueChange={(value) => setStudyGoals({ ...studyGoals, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="literature">Literature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <StudyGoalField
              label="Topic"
              value={studyGoals.topic}
              onChange={(value) => setStudyGoals({ ...studyGoals, topic: value })}
              placeholder="e.g., Waves, Calculus, World War II"
            />
            <StudyGoalField
              label="Focus Area"
              value={studyGoals.focusArea}
              onChange={(value) => setStudyGoals({ ...studyGoals, focusArea: value })}
              placeholder="e.g., Sound Waves, Derivatives, European Theater"
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Let's assess your current knowledge. Answer these questions to help us understand your baseline.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assessment1">
                  How would you explain {studyGoals.focusArea} to someone who has never heard of it?
                </Label>
                <Textarea
                  id="assessment1"
                  value={competencyAnswers[0] || ""}
                  onChange={(e) => {
                    const newAnswers = [...competencyAnswers]
                    newAnswers[0] = e.target.value
                    setCompetencyAnswers(newAnswers)
                  }}
                  placeholder="Explain in your own words..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="assessment2">
                  Can you think of a real-world application of {studyGoals.focusArea} that relates to your interests?
                </Label>
                <Textarea
                  id="assessment2"
                  value={competencyAnswers[1] || ""}
                  onChange={(e) => {
                    const newAnswers = [...competencyAnswers]
                    newAnswers[1] = e.target.value
                    setCompetencyAnswers(newAnswers)
                  }}
                  placeholder="Connect it to something you're passionate about..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 4:
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
      title="Welcome to Learning Companion"
      description={steps[currentStep]}
      currentStep={currentStep}
      totalSteps={steps.length}
      canProceed={canProceed()}
      onNext={handleNext}
      onBack={handleBack}
    >
      {renderStepContent()}
    </OnboardingStep>
  )
}
