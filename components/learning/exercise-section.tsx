import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Function to detect and format equations in text
function formatTextWithEquations(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  
  // Regex to match LaTeX equations: $$...$$ for display, $...$ for inline
  const equationRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g
  
  let lastIndex = 0
  let match
  let keyCounter = 0
  
  while ((match = equationRegex.exec(text)) !== null) {
    // Add text before the equation
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      if (beforeText.trim()) {
        parts.push(<span key={`text-${keyCounter++}`}>{beforeText}</span>)
      }
    }
    
    // Add the equation
    const equation = match[0]
    const isDisplayMode = equation.startsWith('$$')
    
    parts.push(
      <span
        key={`equation-${keyCounter++}`}
        className={`mathjax-equation ${isDisplayMode ? 'block text-center my-4' : 'inline'}`}
        data-equation={equation}
      >
        {equation}
      </span>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText.trim()) {
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>)
    }
  }
  
  // If no equations found, return the original text
  if (parts.length === 0) {
    parts.push(<span key="text-0">{text}</span>)
  }
  
  return parts
}

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

type ExerciseStatus = 'in_progress' | 'wrong' | 'complete'

interface ExerciseSectionProps {
  conceptId: string
  className?: string
}

export function ExerciseSection({ conceptId, className }: ExerciseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>('in_progress')
  const [exerciseData, setExerciseData] = useState<ExercisePrompt[]>([
    {
      id: '1',
      content: 'Now let\'s practice! I\'ll guide you through solving a two-step equation step by step.',
      requiresResponse: false,
      messages: []
    },
    {
      id: '2', 
      content: 'Here\'s your first problem: $3x + 7 = 22$\n\nBefore we solve it, tell me: What do you think the first step should be?',
      requiresResponse: true,
      messages: []
    }
  ])

  const [currentInput, setCurrentInput] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const contentRef = useRef<HTMLDivElement>(null)

  // Initialize MathJax
  useEffect(() => {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          processHtmlClass: 'mathjax-equation',
          ignoreHtmlClass: 'no-mathjax'
        },
        startup: {
          ready: () => {
            window.MathJax.startup.defaultReady()
          }
        }
      }
      
      const mathJaxScript = document.createElement('script')
      mathJaxScript.id = 'MathJax-script'
      mathJaxScript.async = true
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'
      document.head.appendChild(mathJaxScript)
    }
  }, [])

  // Re-render equations when content changes
  useEffect(() => {
    const renderEquations = () => {
      if (window.MathJax && window.MathJax.typesetPromise && contentRef.current) {
        window.MathJax.typesetPromise([contentRef.current]).catch((err: any) => {
          console.error('MathJax rendering error:', err)
        })
      } else {
        setTimeout(renderEquations, 500)
      }
    }
    
    const timer = setTimeout(renderEquations, 100)
    return () => clearTimeout(timer)
  }, [exerciseData, isExpanded])

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
        content: 'Great thinking! That\'s exactly right. Now let\'s continue to the next step...\n\nTo solve $3x + 7 = 22$, we need to isolate $x$. The next step would be to subtract 7 from both sides: $3x = 15$',
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
      
      // Demo: randomly set status based on response (in real app, this would be based on correctness)
      const randomStatus: ExerciseStatus = Math.random() > 0.7 ? 'complete' : Math.random() > 0.5 ? 'wrong' : 'in_progress'
      setExerciseStatus(randomStatus)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent, promptId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendResponse(promptId)
    }
  }

  const getBorderColor = (status: ExerciseStatus) => {
    switch (status) {
      case 'in_progress':
        return 'border-l-blue-500'
      case 'wrong':
        return 'border-l-red-500'
      case 'complete':
        return 'border-l-green-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div className={cn("w-full mt-8", className)}>
      <Card className="bg-muted/20 border-border">
        <CardContent className="p-0">
          {/* Header */}
          <div 
            className={cn(
              "flex items-center justify-between p-4 cursor-pointer bg-muted/30 hover:bg-muted/40 transition-colors",
              "border-l-4",
              isExpanded ? "rounded-tl-md" : "rounded-l-md",
              getBorderColor(exerciseStatus)
            )}
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
              <div ref={contentRef} className="p-6 space-y-8">
                {exerciseData.map((prompt) => (
                  <div key={prompt.id} className="space-y-4">
                    {/* AI Prompt */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed">
                        {formatTextWithEquations(prompt.content)}
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
                              {formatTextWithEquations(message.content)}
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

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: any
  }
} 