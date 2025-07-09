import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  disabled?: boolean
  timestamp: Date
}

interface ExercisePrompt {
  id: string
  content: string
  requiresResponse: boolean
  messages: ExerciseMessage[]
}

interface ExerciseSectionProps {
  conceptId: string
  className?: string
}

export function ExerciseSection({ conceptId, className }: ExerciseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exerciseData, setExerciseData] = useState<ExercisePrompt[]>([
    {
      id: '1',
      content: 'Now let\'s practice! I\'ll guide you through solving a two-step equation step by step.',
      requiresResponse: false,
      messages: []
    },
    {
      id: '2', 
      content: 'Here\'s your first problem: **3x + 7 = 22**\n\nBefore we solve it, tell me: What do you think the first step should be?',
      requiresResponse: true,
      messages: []
    }
  ])

  const [currentInput, setCurrentInput] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})

  const handleSendResponse = async (promptId: string) => {
    const input = currentInput[promptId]?.trim()
    if (!input) return

    setIsLoading(prev => ({ ...prev, [promptId]: true }))

    // Add user message
    const userMessage: ExerciseMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input,
      disabled: true,
      timestamp: new Date()
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ExerciseMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: 'Great thinking! That\'s exactly right. Now let\'s continue to the next step...',
        timestamp: new Date()
      }

      setExerciseData(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, messages: [...prompt.messages, userMessage, aiResponse] }
            : prompt
        )
      )

      setCurrentInput(prev => ({ ...prev, [promptId]: '' }))
      setIsLoading(prev => ({ ...prev, [promptId]: false }))
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent, promptId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendResponse(promptId)
    }
  }

  return (
    <div className={cn("w-full mt-8", className)}>
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-0">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer bg-muted/30 hover:bg-muted/40 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="text-xl font-medium text-white">Practice Exercise</h2>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="border-t border-border">
              <div className="p-6 space-y-8">
                {exerciseData.map((prompt) => (
                  <div key={prompt.id} className="space-y-4">
                    {/* AI Prompt */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {prompt.content}
                      </p>
                    </div>

                    {/* Messages History */}
                    <div className="space-y-3">
                      {prompt.messages.map((message) => (
                        message.type === 'user' ? (
                          <div
                            key={message.id}
                            className="mx-2"
                          >
                            <div className="bg-muted/50 border border-border p-4 rounded-lg">
                              <p className="text-foreground/80 leading-relaxed text-center">
                                {message.content}
                              </p>
                              <div className="text-xs text-muted-foreground mt-2 text-center">
                                You • {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={message.id} className="mx-2">
                            <p className="text-foreground leading-relaxed">
                              {message.content}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              AI Tutor • {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Input Area (if response required) */}
                    {prompt.requiresResponse && (
                      <div className="mx-2 space-y-2">
                        <div className="relative">
                          <Textarea
                            value={currentInput[prompt.id] || ''}
                            onChange={(e) => setCurrentInput(prev => ({ ...prev, [prompt.id]: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, prompt.id)}
                            placeholder="Type your response here..."
                            className={cn(
                              "min-h-[80px] resize-none pr-12",
                              "bg-background border-border text-foreground placeholder:text-muted-foreground",
                              "focus:ring-2 focus:ring-ring focus:border-ring"
                            )}
                            disabled={isLoading[prompt.id]}
                          />
                          
                          {/* Send Button */}
                          <Button
                            onClick={() => handleSendResponse(prompt.id)}
                            disabled={isLoading[prompt.id] || !currentInput[prompt.id]?.trim()}
                            className={cn(
                              "absolute right-2 bottom-2 h-8 w-8 p-0",
                              "bg-primary hover:bg-primary/90 text-primary-foreground"
                            )}
                          >
                            {isLoading[prompt.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 