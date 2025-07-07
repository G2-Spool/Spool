"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Plus, X, Turtle, Zap, Gauge } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [interestDetails, setInterestDetails] = useState<Record<string, string>>({})
  const [studyGoals, setStudyGoals] = useState({
    subject: "",
    topic: "",
    focusArea: "",
  })
  const [competencyAnswers, setCompetencyAnswers] = useState<string[]>([])
  const [learningPace, setLearningPace] = useState("")

  const steps = ["Interests & Hobbies", "Interest Details", "Study Goals", "Competency Assessment", "Learning Pace"]

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
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
      // Save onboarding data
      const onboardingData = {
        interests,
        interestDetails,
        studyGoals,
        competencyAnswers,
        learningPace,
      }
      localStorage.setItem("user-profile", JSON.stringify(onboardingData))
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
        return interests.every((interest) => interestDetails[interest]?.trim())
      case 2:
        return studyGoals.subject && studyGoals.topic && studyGoals.focusArea
      case 3:
        return competencyAnswers.length > 0 && competencyAnswers.every((answer) => answer.trim())
      case 4:
        return learningPace !== ""
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="interest">Add your interests and hobbies</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="e.g., baking, guitar, video games"
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                />
                <Button onClick={addInterest} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                  <span>{interest}</span>
                  <button onClick={() => removeInterest(interest)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
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
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={studyGoals.topic}
                onChange={(e) => setStudyGoals({ ...studyGoals, topic: e.target.value })}
                placeholder="e.g., Waves, Calculus, World War II"
              />
            </div>
            <div>
              <Label htmlFor="focus">Focus Area</Label>
              <Input
                id="focus"
                value={studyGoals.focusArea}
                onChange={(e) => setStudyGoals({ ...studyGoals, focusArea: e.target.value })}
                placeholder="e.g., Sound Waves, Derivatives, European Theater"
              />
            </div>
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
                    icon: Turtle,
                    description: "2 questions per day - Take it slow and steady",
                  },
                  {
                    value: "steady",
                    label: "Steady",
                    icon: Gauge,
                    description: "3-4 questions per day - Balanced approach",
                  },
                  {
                    value: "rabbit",
                    label: "Fast",
                    icon: Zap,
                    description: "5-6 questions per day - Fast-paced learning",
                  },
                ].map((pace) => (
                  <Card
                    key={pace.value}
                    className={`cursor-pointer transition-colors ${
                      learningPace === pace.value ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setLearningPace(pace.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <pace.icon className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-medium">{pace.label}</div>
                          <div className="text-sm text-muted-foreground">{pace.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Welcome to Learning Companion</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">{Math.round(((currentStep + 1) / steps.length) * 100)}%</div>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
