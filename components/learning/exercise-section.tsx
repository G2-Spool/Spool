import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Send, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudyStreak } from '@/hooks/use-study-streak'

// Animation Components
const ThoughtBubble = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="italic">{text}</span>
  </div>
)

const TypeWriter = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedSegments, setDisplayedSegments] = useState<JSX.Element[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Function to trigger MathJax rendering
  const renderMath = () => {
    if (window.MathJax && window.MathJax.typesetPromise && elementRef.current) {
      window.MathJax.typesetPromise([elementRef.current]).catch((err: any) => {
        console.error('MathJax TypeWriter rendering error:', err)
      })
    }
  }

  // Parse text into segments with their types and positions
  const parseTextSegments = (text: string) => {
    const segments: Array<{ 
      type: 'text' | 'bold' | 'italic' | 'equation'; 
      content: string; 
      displayContent: string;
      isDisplay?: boolean;
      start: number;
      end: number;
    }> = []
    
    const formatRegex = /(\\?\$\$[\s\S]*?\\?\$\$|\\?\$[^$\n]*?\\?\$|<strong>.*?<\/strong>|<em>.*?<\/em>|<b>.*?<\/b>|<i>.*?<\/i>)/g
    
    let lastIndex = 0
    let match
    let displayPosition = 0

    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index)
        if (beforeText) {
          segments.push({
            type: 'text',
            content: beforeText,
            displayContent: beforeText,
            start: displayPosition,
            end: displayPosition + beforeText.length
          })
          displayPosition += beforeText.length
        }
      }

      const matchedText = match[0]
      let displayContent = matchedText
      let type: 'text' | 'bold' | 'italic' | 'equation' = 'text'
      let isDisplay = false

      if (matchedText.includes('$')) {
        type = 'equation'
        displayContent = matchedText
        isDisplay = matchedText.includes('$$')
      } else if (matchedText.startsWith('<strong>') || matchedText.startsWith('<b>')) {
        type = 'bold'
        displayContent = matchedText.replace(/<\/?(?:strong|b)>/g, '')
      } else if (matchedText.startsWith('<em>') || matchedText.startsWith('<i>')) {
        type = 'italic'
        displayContent = matchedText.replace(/<\/?(?:em|i)>/g, '')
      }

      segments.push({
        type,
        content: matchedText,
        displayContent,
        isDisplay,
        start: displayPosition,
        end: displayPosition + displayContent.length
      })
      
      displayPosition += displayContent.length
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex)
      if (remainingText) {
        segments.push({
          type: 'text',
          content: remainingText,
          displayContent: remainingText,
          start: displayPosition,
          end: displayPosition + remainingText.length
        })
      }
    }

    return segments
  }

  useEffect(() => {
    if (isComplete) return

    const segments = parseTextSegments(text)
    const totalDisplayLength = segments.reduce((sum, seg) => sum + seg.displayContent.length, 0)
    
    let currentDisplayIndex = 0
    const timer = setInterval(() => {
      if (currentDisplayIndex >= totalDisplayLength) {
        setIsComplete(true)
        clearInterval(timer)
        onComplete?.()
        return
      }

      // Find which segment we're currently typing
      let accumulatedLength = 0
      const currentSegments: JSX.Element[] = []
      let shouldRenderMath = false

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const segmentStart = accumulatedLength
        const segmentEnd = accumulatedLength + segment.displayContent.length

        if (currentDisplayIndex >= segmentEnd) {
          // Segment is complete
          const element = (() => {
            switch (segment.type) {
              case 'bold':
                return <strong key={`seg-${i}`} className="font-semibold">{segment.displayContent}</strong>
              case 'italic':
                return <em key={`seg-${i}`} className="italic">{segment.displayContent}</em>
              case 'equation':
                return (
                  <span
                    key={`seg-${i}`}
                    className={`mathjax-equation ${segment.isDisplay ? 'block text-center my-4' : 'inline'}`}
                    data-equation={segment.content}
                  >
                    {segment.content}
                  </span>
                )
              default:
                return <span key={`seg-${i}`}>{segment.displayContent}</span>
            }
          })()
          currentSegments.push(element)
          
          // Check if we just completed an equation
          if (segment.type === 'equation' && currentDisplayIndex === segmentEnd) {
            shouldRenderMath = true
          }
        } else if (currentDisplayIndex > segmentStart) {
          // Segment is partially typed
          const partialLength = currentDisplayIndex - segmentStart
          const partialContent = segment.displayContent.slice(0, partialLength)
          
          const element = (() => {
            switch (segment.type) {
              case 'bold':
                return <strong key={`seg-${i}`} className="font-semibold">{partialContent}</strong>
              case 'italic':
                return <em key={`seg-${i}`} className="italic">{partialContent}</em>
              case 'equation':
                return <span key={`seg-${i}`}>{segment.content.slice(0, partialLength)}</span>
              default:
                return <span key={`seg-${i}`}>{partialContent}</span>
            }
          })()
          currentSegments.push(element)
          break
        } else {
          // Haven't reached this segment yet
          break
        }

        accumulatedLength += segment.displayContent.length
      }

      setDisplayedSegments(currentSegments)
      
      if (shouldRenderMath) {
        setTimeout(renderMath, 100)
      }
      
      currentDisplayIndex++
    }, 15)

    return () => clearInterval(timer)
  }, [text, isComplete, onComplete])

  // Final MathJax rendering on completion
  useEffect(() => {
    if (isComplete) {
      setTimeout(renderMath, 50)
    }
  }, [isComplete])

  return (
    <div ref={elementRef} className="whitespace-pre-wrap">
      {displayedSegments}
    </div>
  )
}

// Function to detect and format equations and HTML in text
function formatTextWithEquations(text: string): JSX.Element[] {
  const parts: JSX.Element[] = []
  
  // Combined regex for LaTeX equations (including escaped), HTML tags
  const formatRegex = /(\\?\$\$[\s\S]*?\\?\$\$|\\?\$[^$\n]*?\\?\$|<strong>.*?<\/strong>|<em>.*?<\/em>|<b>.*?<\/b>|<i>.*?<\/i>)/g
  
  let lastIndex = 0
  let match
  let keyCounter = 0
  
  while ((match = formatRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      if (beforeText) { // Don't check trim() - preserve all whitespace including newlines
        parts.push(<span key={`text-${keyCounter++}`}>{beforeText}</span>)
      }
    }
    
    const matchedText = match[0]
    
    if (matchedText.includes('$')) {
      // Handle LaTeX equations (both escaped and unescaped)
      const isDisplayMode = matchedText.includes('$$')
    parts.push(
      <span
        key={`equation-${keyCounter++}`}
        className={`mathjax-equation ${isDisplayMode ? 'block text-center my-4' : 'inline'}`}
          data-equation={matchedText}
      >
          {matchedText}
      </span>
    )
    } else if (matchedText.startsWith('<strong>') || matchedText.startsWith('<b>')) {
      // Handle bold text
      const content = matchedText.replace(/<\/?(?:strong|b)>/g, '')
      parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{content}</strong>)
    } else if (matchedText.startsWith('<em>') || matchedText.startsWith('<i>')) {
      // Handle italic text
      const content = matchedText.replace(/<\/?(?:em|i)>/g, '')
      parts.push(<em key={`italic-${keyCounter++}`} className="italic">{content}</em>)
    }
    
    lastIndex = match.index + match[0].length
  }
  
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) { // Don't check trim() - preserve all whitespace including newlines
      parts.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>)
    }
  }
  
  if (parts.length === 0) {
    parts.push(<span key="text-0">{text}</span>)
  }
  
  return parts
}

// Highlight text based on AI feedback tags
function highlightText(text: string, highlights: { start: number; end: number; type: 'correct' | 'incorrect' | 'warning' }[]) {
  if (!highlights.length) return text

  const parts = []
  let lastIndex = 0

  highlights.forEach((highlight, index) => {
    if (highlight.start > lastIndex) {
      parts.push(text.slice(lastIndex, highlight.start))
    }

    const highlightedText = text.slice(highlight.start, highlight.end)
    const className = {
      correct: 'bg-green-100 text-green-800 px-1 rounded',
      incorrect: 'bg-red-100 text-red-800 px-1 rounded',
      warning: 'bg-yellow-100 text-yellow-800 px-1 rounded'
    }[highlight.type]

    parts.push(
      <span key={`highlight-${index}`} className={className}>
        {highlightedText}
      </span>
    )

    lastIndex = highlight.end
  })

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

// Function to highlight text based on error strings from AI
function highlightErrorText(text: string, errorStrings: string[]) {
  if (!errorStrings.length) return text

  let result = text
  let parts: React.ReactNode[] = []
  let processedText = text

  // Sort error strings by length (longest first) to handle overlapping matches
  const sortedErrors = [...errorStrings].sort((a, b) => b.length - a.length)
  
  // Track already highlighted positions to avoid double highlighting
  const highlightedRanges: { start: number; end: number }[] = []

  sortedErrors.forEach((errorString, errorIndex) => {
    const regex = new RegExp(errorString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    let match

    while ((match = regex.exec(processedText)) !== null) {
      const start = match.index
      const end = start + match[0].length

      // Check if this range overlaps with already highlighted ranges
      const overlaps = highlightedRanges.some(range => 
        (start >= range.start && start < range.end) || 
        (end > range.start && end <= range.end) ||
        (start <= range.start && end >= range.end)
      )

      if (!overlaps) {
        highlightedRanges.push({ start, end })
      }
    }
  })

  // Sort ranges by start position
  highlightedRanges.sort((a, b) => a.start - b.start)

  // Build the final JSX with highlights
  let lastIndex = 0
  highlightedRanges.forEach((range, index) => {
    // Add text before highlight
    if (range.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.slice(lastIndex, range.start)}
        </span>
      )
    }

    // Add highlighted text
    parts.push(
      <span key={`error-${index}`} className="bg-red-600/20 text-white px-1 rounded border border-red-800">
        {text.slice(range.start, range.end)}
      </span>
    )

    lastIndex = range.end
  })

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="remaining">
        {text.slice(lastIndex)}
      </span>
    )
  }

  return parts.length > 0 ? parts : text
}

interface StepFeedback {
  stepNumber: number
  status: 'correct' | 'incorrect' | 'partial'
  feedback: string
  highlights?: { start: number; end: number; type: 'correct' | 'incorrect' | 'warning' }[]
}

interface ExerciseMessage {
  id: string
  type: 'ai' | 'user' | 'analysis' | 'formatted_response' | 'feedback'
  content: string
  disabled?: boolean
  timestamp: Date
  stepFeedback?: StepFeedback[]
  isTyping?: boolean
  highlights?: { start: number; end: number; type: 'correct' | 'incorrect' | 'warning' }[]
  errorStrings?: string[] // Text strings to highlight as errors in user response
}

interface ExercisePrompt {
  id: string
  content: string
  requiresResponse: boolean
  messages: ExerciseMessage[]
}

type ExerciseStatus = 'in_progress' | 'analyzing' | 'providing_feedback' | 'complete' | 'needs_remediation'
type InteractionState = 'waiting' | 'analyzing' | 'formatting' | 'grading' | 'responding' | 'complete'

interface ExerciseSectionProps {
  conceptId: string
  conceptTitle?: string
  topicId?: string
  className?: string
}

export function ExerciseSection({ conceptId, conceptTitle, topicId, className }: ExerciseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>('in_progress')
  const [interactionState, setInteractionState] = useState<InteractionState>('waiting')
  const [hasRecordedCompletion, setHasRecordedCompletion] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0) // Start with first prompt
  const [showAdvancedExercise, setShowAdvancedExercise] = useState(false)
  const [isAiTypingComplete, setIsAiTypingComplete] = useState(false)
  const [completedTypingIds, setCompletedTypingIds] = useState<Set<string>>(new Set())
  const { recordCompletion } = useStudyStreak()
  
  // Advanced Exercise Component
  const AdvancedExercise = () => {
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(true)
    const [advancedStatus, setAdvancedStatus] = useState<ExerciseStatus>('in_progress')
    const [advancedInput, setAdvancedInput] = useState('')
    const [isAdvancedLoading, setIsAdvancedLoading] = useState(false)
    const [isAdvancedTypingComplete, setIsAdvancedTypingComplete] = useState(false)
    const [advancedTypingCompleted, setAdvancedTypingCompleted] = useState(false)

    const handleAdvancedSubmit = () => {
      if (!advancedInput.trim()) return
      setIsAdvancedLoading(true)
      
      // Simulate processing
      setTimeout(() => {
        setAdvancedStatus('complete')
        setIsAdvancedLoading(false)
        setAdvancedInput('')
      }, 3000)
    }

    return (
      <div className="w-full mt-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <div 
              className={cn(
                "flex items-center justify-between p-6 cursor-pointer",
                "bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-200",
                "border-l-4",
                isAdvancedExpanded ? "rounded-t-lg" : "rounded-lg",
                advancedStatus === 'complete' ? "border-l-green-500" : "border-l-orange-500"
              )}
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">Advanced Exercise</h2>
                {advancedStatus === 'complete' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete</span>
                  </div>
                )}
              </div>
              {isAdvancedExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {isAdvancedExpanded && (
              <div className="border-t border-border/50">
                <div className="p-6 space-y-6">
                  <div className="flex justify-start">
                    <div className="w-[90%] prose prose-sm">
                                                        <div className="text-foreground leading-relaxed text-left">
                        {!advancedTypingCompleted ? (
                          <TypeWriter 
                            text="Excellent work! You've mastered the basic two-step equation. Now let's try a more challenging problem.

<strong>Advanced Exercise</strong>: You are ordering custom t-shirts for a club. The company charges a $40 setup fee for the design. Each shirt costs $8. You also have a coupon for $10 off your entire order. If your final bill is $110, how many shirts (s) did you order?

<em>Hint: Think carefully about when the coupon discount is applied.</em>"
                            onComplete={() => {
                              setIsAdvancedTypingComplete(true)
                              setAdvancedTypingCompleted(true)
                            }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {formatTextWithEquations(`Excellent work! You've mastered the basic two-step equation. Now let's try a more challenging problem.

<strong>Advanced Exercise</strong>: You are ordering custom t-shirts for a club. The company charges a $40 setup fee for the design. Each shirt costs $8. You also have a coupon for $10 off your entire order. If your final bill is $110, how many shirts (s) did you order?

<em>Hint: Think carefully about when the coupon discount is applied.</em>`)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {advancedStatus === 'in_progress' && isAdvancedTypingComplete && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Textarea
                          value={advancedInput}
                          onChange={(e) => setAdvancedInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAdvancedSubmit()
                            }
                          }}
                          placeholder="Explain your step-by-step approach..."
                          className={cn(
                            "min-h-[100px] resize-none pr-12",
                            "bg-background border-border/50 text-foreground placeholder:text-muted-foreground",
                            "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                          )}
                          disabled={isAdvancedLoading}
                        />
                        
                        <Button
                          onClick={handleAdvancedSubmit}
                          disabled={isAdvancedLoading || !advancedInput.trim()}
                          className={cn(
                            "absolute right-2 bottom-2 h-8 w-8 p-0",
                            "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                          )}
                        >
                          {isAdvancedLoading ? (
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
              </div>
                      )}
        </CardContent>
      </Card>
      
      {/* Advanced Exercise - Shows after basic exercise is complete */}
      {showAdvancedExercise && <AdvancedExercise />}
    </div>
  )
}
  const [exerciseData, setExerciseData] = useState<ExercisePrompt[]>([
    {
      id: '1',
      content: 'Let\'s practice solving two-step equations! I\'ll guide you through this step by step.',
      requiresResponse: false,
      messages: []
    },
    {
      id: '2', 
      content: 'Problem: You want to join a gym. The gym charges a one-time $20 sign-up fee and then $15 per month. You have a total budget of $80 to spend. Write and solve an equation to find out how many months (m) you can be a member.\n\nExplain each step of your thought process.',
      requiresResponse: true,
      messages: []
    },
    {
      id: '3',
      content: 'I see your logic in Step 2 was to "get rid of the 15 first." Let\'s look at the Workflow section again.\n\nWorkflow Step 2 is "Undo Addition/Subtraction" and Step 3 is "Undo Multiplication/Division." You tried to do multiplication/division first. Remember the "getting dressed" mental model: you have to undo things in the reverse order.\n\n<strong>Sub-Exercise</strong>: Let\'s practice that specific step. If you have the equation $10x + 4 = 24$, what is the very first thing you must do to both sides to follow the correct workflow?',
      requiresResponse: true,
      messages: []
    },
    {
      id: '4',
      content: 'Exactly! Now, apply that same logic to your original problem: $15m + 20 = 80$.\n\nWhat should be the very first step?',
      requiresResponse: true,
      messages: []
    },
    {
      id: '5',
      content: 'Perfect! Now continue solving. After subtracting 20 from both sides, what do you get? And then what\'s your next step?',
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

  // Track concept completion for study streak
  useEffect(() => {
    if (exerciseStatus === 'complete' && !hasRecordedCompletion && topicId && conceptTitle) {
      recordCompletion(conceptId, topicId, conceptTitle)
      setHasRecordedCompletion(true)
    }
  }, [exerciseStatus, hasRecordedCompletion, conceptId, topicId, conceptTitle, recordCompletion])

  // Reset typing complete state when moving to new prompt
  useEffect(() => {
    setIsAiTypingComplete(false)
  }, [currentPromptIndex])

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
    setInteractionState('analyzing')

    // Add user message
    const userMessage: ExerciseMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input,
      disabled: true,
      timestamp: new Date()
    }

    // Add analysis state
    const analysisMessage: ExerciseMessage = {
      id: `analysis_${Date.now()}`,
      type: 'analysis',
      content: 'Analyzing your response...',
      timestamp: new Date()
    }

    setExerciseData(prev => 
      prev.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, messages: [...prompt.messages, userMessage, analysisMessage] }
          : prompt
      )
    )

        // Simulate analysis phase
    setTimeout(() => {
      setInteractionState('formatting')
      
      // Remove analysis message
      setExerciseData(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                messages: [...prompt.messages.filter(m => m.type !== 'analysis')]
              }
            : prompt
        )
      )

      // Start the sequential AI response chain
      setTimeout(() => {
        setInteractionState('responding')
        
        // First AI response: Evaluation
        const evaluationResponse: ExerciseMessage = {
          id: `evaluation_${Date.now()}`,
          type: 'ai',
          content: `<strong>Evaluation Complete</strong>

<strong>Step 1</strong>: ✅ Correctly formulated equation.

<strong>Step 2</strong>: ❌ Incorrect order of operations.

<strong>Step 3</strong>: ❌ Incorrect application of division.

<strong>Step 4</strong>: ❌ Incorrect result.`,
          timestamp: new Date(),
          isTyping: true,
          errorStrings: ["divide by 15", "15m / 15", "get rid of the 15 first", "divide both sides by 15"] // Common order of operations errors
        }

        setExerciseData(prev => 
          prev.map(prompt => 
            prompt.id === promptId 
              ? { 
                  ...prompt, 
                  messages: [
                    ...prompt.messages.map(msg => 
                      msg.type === 'user' && msg.id === userMessage.id 
                        ? { ...msg, errorStrings: evaluationResponse.errorStrings } 
                        : msg
                    ), 
                    evaluationResponse
                  ] 
                }
              : prompt
          )
        )

        // After evaluation typing completes, add step analysis
        setTimeout(() => {
          const stepAnalysisResponse: ExerciseMessage = {
            id: `step_analysis_${Date.now()}`,
            type: 'ai',
            content: `<strong>Step Analysis:</strong>

<strong>Step 1</strong>: ✅ Correctly formulated equation
<strong>Step 2</strong>: ❌ Incorrect order of operations  
<strong>Step 3</strong>: ❌ Incorrect application of division
<strong>Step 4</strong>: ❌ Incorrect result`,
            timestamp: new Date(),
            isTyping: true
          }

          setExerciseData(prev => 
            prev.map(prompt => 
              prompt.id === promptId 
                ? { ...prompt, messages: [...prompt.messages, stepAnalysisResponse] }
                : prompt
            )
          )

                     // Complete the interaction after step analysis is done
           setTimeout(() => {
      setCurrentInput(prev => ({ ...prev, [promptId]: '' }))
      setIsLoading(prev => ({ ...prev, [promptId]: false }))
             setInteractionState('waiting')
             
             // Advance to next prompt if available
             if (currentPromptIndex < 4) { // First 5 prompts (0-4) are the basic exercise
               setCurrentPromptIndex(prev => prev + 1)
             } else {
               // Complete the basic exercise
               setInteractionState('complete')
               setExerciseStatus('complete')
               
               // Add completion message
               const completionMessage: ExerciseMessage = {
                 id: `completion_${Date.now()}`,
                 type: 'ai',
                 content: '🎉 <strong>Excellent work!</strong> You have successfully mastered the basic two-step equation solving process. You correctly applied the "reverse order of operations" and balanced the equation at each step.',
                 timestamp: new Date(),
                 isTyping: true
               }

               setExerciseData(prev => 
                 prev.map(prompt => 
                   prompt.id === promptId 
                     ? { ...prompt, messages: [...prompt.messages, completionMessage] }
                     : prompt
                 )
               )
               
               // Collapse the current exercise and show advanced exercise
               setTimeout(() => {
                 setIsExpanded(false)
                 setShowAdvancedExercise(true)
               }, 4000)
             }
           }, 3000) // Wait for step analysis to complete
        }, 4000) // Wait for evaluation to complete
      }, 1000)
    }, 2000)
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
      case 'analyzing':
        return 'border-l-yellow-500'
      case 'providing_feedback':
        return 'border-l-purple-500'
      case 'needs_remediation':
        return 'border-l-orange-500'
      case 'complete':
        return 'border-l-green-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div className={cn("w-full mt-8", className)}>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {/* Header */}
          <div 
            className={cn(
              "flex items-center justify-between p-6 cursor-pointer",
              "bg-gradient-to-r from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-200",
              "border-l-4",
              isExpanded ? "rounded-t-lg" : "rounded-lg",
              getBorderColor(exerciseStatus)
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-foreground">Practice Exercise</h2>
              {exerciseStatus !== 'in_progress' && (
                <div className="flex items-center gap-2 text-sm">
                  {exerciseStatus === 'complete' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </div>
                  )}
                  {exerciseStatus === 'needs_remediation' && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Needs Review</span>
                    </div>
                  )}
                  {exerciseStatus === 'analyzing' && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="border-t border-border/50">
              <div ref={contentRef} className="p-6 space-y-8">
                                {(() => {
                                     // Build complete timeline of all content (prompts + messages)
                   interface TimelineItem {
                     type: 'prompt' | 'user' | 'ai' | 'analysis' | 'feedback';
                     id: string;
                     content: string;
                     promptId?: string;
                     promptIndex?: number;
                     isTyping?: boolean;
                     stepFeedback?: StepFeedback[];
                     timestamp?: Date;
                     errorStrings?: string[];
                     requiresResponse?: boolean;
                   }
                  
                  const timeline: TimelineItem[] = []
                  
                  // Add all prompts and their messages in chronological order
                  exerciseData.slice(0, currentPromptIndex + 1).forEach((prompt, promptIndex) => {
                    // Add the prompt itself
                    timeline.push({
                      type: 'prompt',
                      id: `prompt-${prompt.id}`,
                      content: prompt.content,
                      promptId: prompt.id,
                      promptIndex,
                      isTyping: promptIndex === currentPromptIndex,
                      requiresResponse: prompt.requiresResponse
                    })
                    
                    // Add all messages for this prompt
                    prompt.messages.forEach(message => {
                      timeline.push({
                        type: message.type as 'user' | 'ai' | 'analysis' | 'feedback',
                        id: message.id,
                        content: message.content,
                        promptId: prompt.id,
                        promptIndex,
                        isTyping: message.isTyping,
                        stepFeedback: message.stepFeedback,
                        timestamp: message.timestamp,
                        errorStrings: message.errorStrings
                      })
                    })
                  })
                  
                  // Group timeline items
                  const groupedContent: React.ReactNode[] = []
                  let currentSystemGroup: TimelineItem[] = []
                  let lastPromptForInput: TimelineItem | null = null
                  
                  const renderSystemGroup = (systemItems: TimelineItem[], groupKey: string) => {
                    if (systemItems.length === 0) return null
                    
                    return (
                      <div key={groupKey} className="space-y-3">
                        <div className="flex justify-start">
                          <div className="w-[90%] bg-accent/30 border border-accent/40 rounded-lg p-4 space-y-4">
                            {systemItems.map((item, itemIndex) => (
                              <div key={item.id}>
                                <div className="text-white leading-relaxed text-left">
                                  {item.isTyping && !completedTypingIds.has(item.id) ? (
                                    <TypeWriter 
                                      text={item.content}
                                      onComplete={() => {
                                        setCompletedTypingIds(prev => new Set(prev).add(item.id))
                                        setIsAiTypingComplete(true)
                                        // If this prompt doesn't require a response, auto-advance
                                        if (item.type === 'prompt' && !item.requiresResponse) {
                                          setTimeout(() => {
                                            setCurrentPromptIndex(prev => prev + 1)
                                            setIsAiTypingComplete(false)
                                          }, 1000)
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="whitespace-pre-wrap">
                                      {formatTextWithEquations(item.content)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Step-by-step feedback */}
                                {item.stepFeedback && (
                                  <div className="mt-4 space-y-2">
                                    <h4 className="text-sm font-medium text-white">Step Analysis:</h4>
                                    {item.stepFeedback.map((step) => (
                                      <div key={step.stepNumber} className="flex items-start gap-2 text-sm">
                                        <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs text-white">
                                          {step.stepNumber}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {step.status === 'correct' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                          {step.status === 'incorrect' && <XCircle className="w-4 h-4 text-red-400" />}
                                          {step.status === 'partial' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                                          <span className="text-white">{step.feedback}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {/* Show timestamp for the last system message */}
                            {systemItems.length > 1 && systemItems[systemItems.length - 1].timestamp && (
                              <div className="text-xs text-white/70 mt-2">
                                {systemItems[systemItems.length - 1].timestamp!.toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  
                  // Process timeline items
                  timeline.forEach((item, index) => {
                    if (item.type === 'user') {
                      // Render current system group before user message
                      if (currentSystemGroup.length > 0) {
                        const systemGroupElement = renderSystemGroup(currentSystemGroup, `system-group-${index}`)
                        if (systemGroupElement) {
                          groupedContent.push(systemGroupElement)
                        }
                        currentSystemGroup = []
                      }
                      
                      // Add user message
                      groupedContent.push(
                        <div key={item.id} className="space-y-3">
                          <div className="flex justify-end">
                            <div className="w-[60%] bg-muted border border-border/50 rounded-lg p-4">
                              <div className="text-foreground leading-relaxed whitespace-pre-wrap text-left">
                                {item.errorStrings && item.errorStrings.length > 0 
                                  ? highlightErrorText(item.content, item.errorStrings)
                                  : item.content
                                }
                              </div>
                              <div className="text-xs text-muted-foreground mt-2 text-right">
                                {item.timestamp!.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    } else if (item.type === 'analysis') {
                      groupedContent.push(
                        <div key={item.id} className="space-y-3">
                          <div className="flex justify-start">
                            <div className="w-[90%] py-3">
                              <ThoughtBubble text={item.content} />
                            </div>
                          </div>
                        </div>
                      )
                    } else if (item.type === 'prompt' || item.type === 'ai' || item.type === 'feedback') {
                      // Add to current system group
                      currentSystemGroup.push(item)
                      
                      // Track the last prompt for input area
                      if (item.type === 'prompt' && item.requiresResponse) {
                        lastPromptForInput = item
                      }
                    }
                  })
                  
                  // Render any remaining system group
                  if (currentSystemGroup.length > 0) {
                    const finalSystemGroupElement = renderSystemGroup(currentSystemGroup, 'final-system-group')
                    if (finalSystemGroupElement) {
                      groupedContent.push(finalSystemGroupElement)
                    }
                  }
                  
                                     // Add input area if needed
                   if (lastPromptForInput && lastPromptForInput.promptId && interactionState === 'waiting' && isAiTypingComplete) {
                     const promptId = lastPromptForInput.promptId
                     groupedContent.push(
                       <div key="input-area" className="space-y-3">
                         <div className="relative">
                           <Textarea
                             value={currentInput[promptId] || ''}
                             onChange={(e) => setCurrentInput(prev => ({ ...prev, [promptId]: e.target.value }))}
                             onKeyDown={(e) => handleKeyDown(e, promptId)}
                             placeholder="Explain your step-by-step approach..."
                             className={cn(
                               "min-h-[100px] resize-none pr-12",
                               "bg-background border-border/50 text-foreground placeholder:text-muted-foreground",
                               "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                             )}
                             disabled={isLoading[promptId]}
                           />
                           
                           <Button
                             onClick={() => handleSendResponse(promptId)}
                             disabled={isLoading[promptId] || !currentInput[promptId]?.trim()}
                             className={cn(
                               "absolute right-2 bottom-2 h-8 w-8 p-0",
                               "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                             )}
                           >
                             {isLoading[promptId] ? (
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
                     )
                   }
                  
                  return groupedContent
                })()}
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