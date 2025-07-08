"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, HelpCircle, ThumbsUp, ThumbsDown, Lightbulb, CheckCircle } from "lucide-react"

export function DailyLearningPage() {
  const [currentSection, setCurrentSection] = useState<"exploration" | "study">("exploration")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const explorationContent = {
    title: "Sound Waves and Musical Instruments",
    content: `
      Sound waves are vibrations that travel through air (or other mediums) and can be detected by our ears. 
      When you play a guitar, the strings vibrate at specific frequencies, creating sound waves.
      
      Key concepts:
      • Frequency determines pitch (how high or low a sound is)
      • Amplitude determines volume (how loud or quiet a sound is)
      • Different materials and shapes affect how sound waves travel and resonate
      
      Think about your guitar playing - when you press different frets, you're changing the length of the vibrating string, 
      which changes the frequency and thus the pitch of the note you hear.
    `,
    connections: [
      "Guitar strings vibrate to create sound waves",
      "Fret positions change string length and frequency",
      "Guitar body shape affects resonance and tone",
    ],
  }

  const studyQuestions = [
    {
      question:
        "Imagine you're tuning your guitar and notice that one string sounds 'flat' (lower in pitch than it should be). Using your knowledge of sound waves, explain what's happening physically with the string and how you would fix it. Connect this to the relationship between frequency and pitch.",
      hint: "Think about what affects the frequency of a vibrating string. Consider tension, length, and mass.",
      solution:
        "When a string sounds flat, it's vibrating at a lower frequency than desired. This could be because the string tension is too low. To fix it, you'd tighten the tuning peg to increase tension, which increases the frequency and raises the pitch. The relationship is direct: higher tension = higher frequency = higher pitch.",
      followUp: "How do you think the thickness (mass) of guitar strings affects their pitch?",
    },
    {
      question:
        "You're designing a practice room for guitar playing. Considering what you know about sound waves and your experience with acoustics, what factors would you consider to make the room sound good for practicing? Explain the physics behind your choices.",
      hint: "Consider how sound waves interact with surfaces - reflection, absorption, and resonance.",
      solution:
        "Key factors include: 1) Room shape to avoid standing waves, 2) Sound-absorbing materials to reduce harsh reflections, 3) Some reflective surfaces for natural reverb, 4) Room size to avoid unwanted resonances. The physics involves controlling how sound waves bounce off surfaces and interact with each other.",
      followUp: "Why might a completely soundproof room actually sound 'dead' and unpleasant for music?",
    },
  ]

  const handleAnswerSubmit = () => {
    // In a real app, this would send the answer to an AI service for evaluation
    console.log("Answer submitted:", userAnswer)
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type)
    // In a real app, this would send feedback to improve future content
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Today's Learning Session</h1>
          <p className="text-muted-foreground text-lg">Exploring Sound Waves through your passion for guitar playing</p>
        </div>

      <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as "exploration" | "study")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exploration" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Exploration</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Study Questions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exploration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">{explorationContent.title}</CardTitle>
              <CardDescription className="text-gray-400">
                Learn the core concepts through the lens of your interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                {explorationContent.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">Connections to Guitar Playing:</h4>
                <ul className="space-y-1">
                  {explorationContent.connections.map((connection, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#78af9f]" />
                      <span className="text-sm text-gray-300">{connection}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={() => setCurrentSection("study")} className="w-full mt-6">
                Ready to Practice? Start Study Questions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study" className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {studyQuestions.length}
            </Badge>
            <Progress value={((currentQuestion + 1) / studyQuestions.length) * 100} className="w-32" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-white">Study Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-300">{studyQuestions[currentQuestion].question}</p>

              <div className="space-y-3">
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here... Explain your thinking process."
                  rows={6}
                  className="text-white placeholder:text-gray-500"
                />

                <div className="flex space-x-2">
                  <Button onClick={handleAnswerSubmit} disabled={!userAnswer.trim()}>
                    Submit Answer
                  </Button>
                  <Button variant="outline" onClick={() => setShowHint(!showHint)}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>
                </div>

                {showHint && (
                  <Card className="bg-[#78af9f]/10 border-[#78af9f]/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-[#78af9f] mt-0.5" />
                        <p className="text-sm text-white">{studyQuestions[currentQuestion].hint}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showSolution && (
                  <Card className="bg-[#78af9f]/10 border-[#78af9f]/30">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-[#78af9f] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white mb-2">Solution:</p>
                            <p className="text-sm text-white">{studyQuestions[currentQuestion].solution}</p>
                          </div>
                        </div>
                        <div className="pl-6">
                          <p className="text-sm font-medium text-white mb-1">Follow-up question:</p>
                          <p className="text-sm text-gray-300">{studyQuestions[currentQuestion].followUp}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Was this helpful?</span>
                  <Button
                    variant={feedback === "up" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedback("up")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={feedback === "down" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFeedback("down")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {currentQuestion > 0 && (
                    <Button variant="outline" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                      Previous
                    </Button>
                  )}
                  {currentQuestion < studyQuestions.length - 1 ? (
                    <Button
                      onClick={() => {
                        setCurrentQuestion(currentQuestion + 1)
                        setUserAnswer("")
                        setShowHint(false)
                        setShowSolution(false)
                        setFeedback(null)
                      }}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button onClick={() => setShowSolution(true)}>Show Solution</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
