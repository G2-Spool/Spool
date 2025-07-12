"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Loader2, 
  Lightbulb, 
  X,
  CheckCircle,
  BookOpen,
  Sigma,
  Brain
} from 'lucide-react'
import { useStudyStreak } from '@/hooks/use-study-streak'
import { TypingMessage } from './typing-message'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// Types
interface VocabularyTerm {
  term: string
  definition: string
  type: 'vocabulary' | 'equation' | 'concept'
}

interface ChatMessage {
  id: string
  type: 'system' | 'student' | 'thinking'
  content: string
  timestamp: Date
  isTyping?: boolean
  hasBeenTyped?: boolean // Track if the message has completed typing
  isCurrentlyTyping?: boolean // Track if this message is actively being typed right now
  exerciseId?: string
  isSubExercise?: boolean
  subExerciseLevel?: number
}

interface Exercise {
  id: string
  title: string
  status: 'active' | 'completed' | 'collapsed'
  messages: ChatMessage[]
  isSubExercise?: boolean
  parentId?: string
  level?: number
  currentInput?: string
  isLoading?: boolean
  isTyping?: boolean
  isExpanded?: boolean
}

interface ChatExerciseInterfaceProps {
  conceptId: string
  conceptTitle?: string
  topicId?: string
  className?: string
}

// Vocabulary terms for the concept
const vocabularyTerms: VocabularyTerm[] = [
  { term: 'Variable', definition: 'The letter representing the unknown value you\'re looking for (like x).', type: 'vocabulary' },
  { term: 'Coefficient', definition: 'The number attached to the variable (the 2 in 2x).', type: 'vocabulary' },
  { term: 'Constant', definition: 'A number without a variable (the 5 and 15 in 2x + 5 = 15).', type: 'vocabulary' },
  { term: 'PEMDAS', definition: 'Parentheses, Exponents, Multiplication/Division, Addition/Subtraction - the order of operations.', type: 'concept' },
  { term: '2x + 5 = 15', definition: 'A two-step linear equation where x is multiplied by 2, then 5 is added, equaling 15.', type: 'equation' },
  { term: '15m + 20 = 80', definition: 'A two-step linear equation representing the gym membership problem.', type: 'equation' },
  { term: '10x + 4 = 24', definition: 'A practice two-step linear equation for the sub-exercise.', type: 'equation' }
]

// Mock exercise data
const mockExercises: Exercise[] = [
  {
    id: 'exercise-1',
    title: 'Two-Step Linear Equations Practice',
    status: 'active',
    currentInput: '',
    isLoading: false,
    isTyping: false,
    messages: [
      {
        id: 'msg-1',
        type: 'system',
        content: 'Let\'s practice solving two-step equations! I\'ll guide you through this step by step.',
        timestamp: new Date(),
        exerciseId: 'exercise-1',
        hasBeenTyped: true, // Mark as already typed
        isCurrentlyTyping: false
      },
      {
        id: 'msg-2',
        type: 'system',
        content: 'Problem: You want to join a gym. The gym charges a one-time $20 sign-up fee and then $15 per month. You have a total budget of $80 to spend. Write and solve an equation to find out how many months (m) you can be a member.\n\nExplain each step of your thought process.',
        timestamp: new Date(),
        exerciseId: 'exercise-1',
        hasBeenTyped: true, // Mark as already typed
        isCurrentlyTyping: false
      }
    ]
  }
]



// Mock feedback responses - Updated with completion tag
const mockFeedbackResponses = [
  {
    id: 'feedback-1',
    content: 'Evaluation Complete.\n\n**Step 1:** ✅ Correctly formulated equation.\n\n**Step 2:** ❌ Incorrect order of operations.\n\n**Step 3:** ❌ Incorrect application of division.\n\n**Step 4:** ❌ Incorrect result.\n\nSending articulated Step 2 to remediation AI...'
  },
  {
    id: 'remediation-1',
    content: 'I see your logic in Step 2 was to "get rid of the 15 first." Let\'s look at the **Workflow** section again.\n\n*Workflow Step 2* is "Undo Addition/Subtraction" and *Step 3* is "Undo Multiplication/Division." You tried to do multiplication/division first. Remember the "getting dressed" mental model: you have to undo things in the reverse order.',
    isSubExercise: true
  },
  {
    id: 'sub-exercise-1',
    content: 'Sub-Exercise: Let\'s practice that specific step. If you have the equation $10x + 4 = 24$, what is the very first thing you must do to both sides to follow the correct workflow?',
    isSubExercise: true
  },
  {
    id: 'sub-exercise-response',
    content: 'Exactly! Now, apply that same logic to your original problem: $15m + 20 = 80$.\n\nWhat should be the very first step?'
  },
  {
    id: 'completion-response',
    content: 'Perfect! You correctly identified that we need to subtract 20 from both sides first. This gives us $15m = 60$, and then dividing by 15 gives us $m = 4$.\n\n**Solution:** You can be a member for 4 months! 🎉\n\n<EXERCISE_COMPLETE>Two-Step Linear Equations Practice</EXERCISE_COMPLETE>\n\nExcellent work mastering this concept! You\'ve demonstrated solid understanding of the correct order of operations in solving two-step equations.'
  }
]

// Vocabulary parsing function
const parseVocabularyTerms = (text: string): React.ReactNode => {
  const elements: React.ReactNode[] = []
  let lastIndex = 0

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...vocabularyTerms].sort((a, b) => b.term.length - a.term.length)

  sortedTerms.forEach(vocab => {
    const regex = new RegExp(`\\b${vocab.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index !== undefined) {
        const start = match.index
        const end = start + match[0].length
        
        // Add text before the term
        if (start > lastIndex) {
          elements.push(text.slice(lastIndex, start))
        }
        
        // Add the vocabulary term as interactive element
        elements.push(
          <VocabularyHighlight 
            key={`${vocab.term}-${start}`}
            term={vocab.term}
            definition={vocab.definition}
            type={vocab.type}
          />
        )
        
        lastIndex = end
      }
    }
  })

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex))
  }

  return elements.length > 0 ? elements : text
}

// Vocabulary highlight component
const VocabularyHighlight: React.FC<{
  term: string
  definition: string
  type: 'vocabulary' | 'equation' | 'concept'
}> = ({ term, definition, type }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 2000)
    setTooltipTimer(timer)
  }

  const handleMouseLeave = () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }
    setShowTooltip(false)
  }

  const handleClick = () => {
    // Scroll to definition in upper sections
    const definitionElement = document.getElementById(`definition-${term}`)
    if (definitionElement) {
      definitionElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <span className="relative inline-block">
      <span
        className={cn(
          "font-semibold cursor-pointer transition-colors duration-200",
          type === 'vocabulary' && "text-[#4FD1C5] hover:text-[#5FE1D5]",
          type === 'equation' && "text-[#805AD5] hover:text-[#9F7AEA]",
          type === 'concept' && "text-[#ED64A6] hover:text-[#F687B3]"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {term}
      </span>
      
             {showTooltip && (
         <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#454545] border border-[#4a4a47] rounded-lg shadow-lg max-w-xs">
           <p className="text-sm text-white leading-relaxed">{definition}</p>
           <div className="absolute top-full left-1/2 transform -translate-x-1/2">
             <div className="w-2 h-2 bg-[#454545] border-r border-b border-[#4a4a47] rotate-45"></div>
           </div>
         </div>
       )}
    </span>
  )
}

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-[#596f6c] rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-[#596f6c] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
    <div className="w-2 h-2 bg-[#596f6c] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
  </div>
)

// Formatted message component for completed messages
const FormattedMessage: React.FC<{
  content: string
  parseVocabulary?: (text: string) => React.ReactNode
}> = ({ content, parseVocabulary }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
        code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) => {
          if (inline) {
            return <code className="px-1 py-0.5 bg-gray-700 rounded text-sm">{children}</code>
          }
          return (
            <pre className="my-2 p-3 bg-gray-800 rounded overflow-x-auto">
              <code>{children}</code>
            </pre>
          )
        },
        ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside ml-4 my-2">{children}</ul>,
        ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside ml-4 my-2">{children}</ol>,
        li: ({ children }: { children?: React.ReactNode }) => <li className="my-1">{children}</li>,
        // Custom text renderer that applies vocabulary parsing
        text: ({ children }: { children?: React.ReactNode }) => {
          if (parseVocabulary && typeof children === 'string') {
            return <>{parseVocabulary(children)}</>
          }
          return <>{children}</>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// Hint button component
const HintButton: React.FC<{ onHint: () => void }> = ({ onHint }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 15000) // 15 seconds delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "absolute bottom-2 right-2 text-xs transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={onHint}
    >
      <Lightbulb className="w-3 h-3 mr-1" />
      Need a hint?
    </Button>
  )
}

// Vocabulary drawer component
const VocabularyDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  newTerms: string[]
  onClearNewTerms: () => void
}> = ({ isOpen, onClose, newTerms, onClearNewTerms }) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Drawer Tab */}
      {!isOpen && (
        <div 
          className={cn(
            "fixed top-1/2 right-0 transform -translate-y-1/2 z-40 transition-all duration-300"
          )}
        >
          <button
            onClick={() => {
              onClearNewTerms()
            }}
            className={cn(
              "bg-[#454545] border border-[#4a4a47] rounded-l-lg px-2 py-8 text-white text-sm font-medium transition-all duration-300",
              "hover:bg-[#505050] border-r-0 opacity-80"
            )}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="transform -rotate-90 whitespace-nowrap">Terms</span>
              {newTerms.length > 0 && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Drawer Content */}
      <div 
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 h-full w-[30%] bg-[#302f2c] border-l border-[#4a4a47] z-30 transition-transform duration-300 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Vocabulary & Terms</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Vocabulary Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Vocabulary
              </h4>
              <div className="space-y-0">
                {vocabularyTerms.filter(term => term.type === 'vocabulary').map((vocab, index, arr) => (
                  <div key={vocab.term}>
                    <div 
                      className={cn(
                        "p-3 transition-all duration-300 hover:bg-[#454545]",
                        newTerms.includes(vocab.term) && "ring-2 ring-yellow-400/50 animate-pulse"
                      )}
                      style={{
                        animationDelay: newTerms.includes(vocab.term) ? `${index * 0.1}s` : '0s'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#4FD1C5]" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">{vocab.term}</h5>
                          <p className="text-sm text-gray-400 leading-relaxed">{vocab.definition}</p>
                        </div>
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="border-b border-[#4a4a47] mx-3"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Equations Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Equations
              </h4>
              <div className="space-y-0">
                {vocabularyTerms.filter(term => term.type === 'equation').map((vocab, index, arr) => (
                  <div key={vocab.term}>
                    <div 
                      className={cn(
                        "p-3 transition-all duration-300 hover:bg-[#454545]",
                        newTerms.includes(vocab.term) && "ring-2 ring-yellow-400/50 animate-pulse"
                      )}
                      style={{
                        animationDelay: newTerms.includes(vocab.term) ? `${index * 0.1}s` : '0s'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#805AD5]" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">{vocab.term}</h5>
                          <p className="text-sm text-gray-400 leading-relaxed">{vocab.definition}</p>
                        </div>
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="border-b border-[#4a4a47] mx-3"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Concepts Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Concepts
              </h4>
              <div className="space-y-0">
                {vocabularyTerms.filter(term => term.type === 'concept').map((vocab, index, arr) => (
                  <div key={vocab.term}>
                    <div 
                      className={cn(
                        "p-3 transition-all duration-300 hover:bg-[#454545]",
                        newTerms.includes(vocab.term) && "ring-2 ring-yellow-400/50 animate-pulse"
                      )}
                      style={{
                        animationDelay: newTerms.includes(vocab.term) ? `${index * 0.1}s` : '0s'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#ED64A6]" />
                        <div>
                          <h5 className="font-semibold text-white mb-1">{vocab.term}</h5>
                          <p className="text-sm text-gray-400 leading-relaxed">{vocab.definition}</p>
                        </div>
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="border-b border-[#4a4a47] mx-3"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Helper function to count terms by type
const getTermCounts = () => {
  const vocabularyCount = vocabularyTerms.filter(term => term.type === 'vocabulary').length
  const equationCount = vocabularyTerms.filter(term => term.type === 'equation').length
  const conceptCount = vocabularyTerms.filter(term => term.type === 'concept').length
  
  return { vocabularyCount, equationCount, conceptCount }
}

// Main component
export function ChatExerciseInterface({ 
  conceptId, 
  conceptTitle, 
  topicId, 
  className 
}: ChatExerciseInterfaceProps) {
  const [exercises, setExercises] = useState<Exercise[]>(
    mockExercises.map(ex => ({ ...ex, isExpanded: true }))
  )
  const [isTyping, setIsTyping] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newTerms, setNewTerms] = useState<string[]>([])
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null)
  const [showHintTooltip, setShowHintTooltip] = useState(false)
  const [hintTooltipTimer, setHintTooltipTimer] = useState<NodeJS.Timeout | null>(null)
  const [jumpToExerciseVisible, setJumpToExerciseVisible] = useState(false)
  const [collapseTimer, setCollapseTimer] = useState<NodeJS.Timeout | null>(null)
  const subExerciseCreationInProgress = useRef<Set<string>>(new Set())
  const [buttonTooltips, setButtonTooltips] = useState<{
    vocab: boolean
    equations: boolean
    concepts: boolean
  }>({ vocab: false, equations: false, concepts: false })
  const [buttonTooltipTimers, setButtonTooltipTimers] = useState<{
    vocab: NodeJS.Timeout | null
    equations: NodeJS.Timeout | null
    concepts: NodeJS.Timeout | null
  }>({ vocab: null, equations: null, concepts: null })
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})
  const { recordCompletion } = useStudyStreak()
  const { vocabularyCount, equationCount, conceptCount } = getTermCounts()

  // Button tooltip handlers
  const handleButtonTooltip = (type: 'vocab' | 'equations' | 'concepts', show: boolean) => {
    if (show) {
      const timer = setTimeout(() => {
        setButtonTooltips(prev => ({ ...prev, [type]: true }))
      }, 500)
      setButtonTooltipTimers(prev => ({ ...prev, [type]: timer }))
    } else {
      if (buttonTooltipTimers[type]) {
        clearTimeout(buttonTooltipTimers[type])
      }
      setButtonTooltips(prev => ({ ...prev, [type]: false }))
      setButtonTooltipTimers(prev => ({ ...prev, [type]: null }))
    }
  }

  // Scroll detection for jump to exercise button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        const isScrolledUp = scrollTop < scrollHeight - clientHeight - 200
        setJumpToExerciseVisible(isScrolledUp)
      }
    }

    const container = chatContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Manage typing queue - ensure only one message types at a time
  useEffect(() => {
    const activeExercise = exercises.find(ex => ex.status === 'active')
    if (!activeExercise) return

    // Find the first system message that needs typing
    const messageNeedingTyping = activeExercise.messages.find(msg => 
      msg.type === 'system' && !msg.hasBeenTyped && !msg.isCurrentlyTyping
    )

    // Check if any message is currently typing
    const isAnyMessageTyping = activeExercise.messages.some(msg => msg.isCurrentlyTyping)

    // Start typing the next message if nothing is currently typing
    if (messageNeedingTyping && !isAnyMessageTyping) {
      setExercises(prev => prev.map(ex => 
        ex.id === activeExercise.id 
          ? {
              ...ex,
              messages: ex.messages.map(msg => 
                msg.id === messageNeedingTyping.id 
                  ? { ...msg, isCurrentlyTyping: true }
                  : msg
              )
            }
          : ex
      ))
    }
  }, [exercises])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // Jump to latest exercise
  const jumpToLatestExercise = () => {
    const activeExercise = exercises.find(ex => ex.status === 'active')
    if (activeExercise && inputRefs.current[activeExercise.id]) {
      inputRefs.current[activeExercise.id]?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  // Handle sending student response for specific exercise
  const handleSendMessage = async (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise || !exercise.currentInput?.trim()) return

    // Prevent double submissions
    if (exercise.isLoading) {
      return
    }

    // Set loading state for this specific exercise
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, isLoading: true } : ex
    ))
    
    // Add student message
    const studentMessage: ChatMessage = {
      id: `student-${Date.now()}`,
      type: 'student',
      content: exercise.currentInput,
      timestamp: new Date(),
      exerciseId: exerciseId
    }

    // Update state with student message
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, messages: [...ex.messages, studentMessage], currentInput: '' }
        : ex
    ))

    // Show typing indicator for this exercise
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, isTyping: true } : ex
    ))
    
    setTimeout(scrollToBottom, 100)

    // Simulate AI processing with realistic delays
    setTimeout(() => {
      setExercises(prev => {
        const updatedExercises = prev.map(ex => 
          ex.id === exerciseId ? { ...ex, isTyping: false } : ex
        )
        
        // Get the current exercise with fresh state
        const currentExercise = updatedExercises.find(ex => ex.id === exerciseId)
        if (!currentExercise) return updatedExercises
        
        const hasSubExercise = currentExercise.messages.some(msg => msg.isSubExercise)
        const studentMessageCount = currentExercise.messages.filter(msg => msg.type === 'student').length
        
        let responseContent = ''
        let shouldCreateSubExercise = false
        let isCompleted = false
        
        // First student response - give feedback and create sub-exercise
        if (studentMessageCount === 1 && !hasSubExercise) {
          responseContent = mockFeedbackResponses[0].content
          shouldCreateSubExercise = true
        } 
        // Response to sub-exercise (student has responded to sub-exercise)
        else if (hasSubExercise && studentMessageCount === 2) {
          responseContent = mockFeedbackResponses[3].content // sub-exercise-response
        }
        // Final response after student gets it right
        else if (studentMessageCount >= 3) {
          responseContent = mockFeedbackResponses[4].content // completion-response
          isCompleted = true
        }
        // Fallback for any other case
        else {
          responseContent = "I can see you're working on this problem. Let me help guide you through the correct approach to solving two-step linear equations."
        }
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'system',
          content: responseContent,
          timestamp: new Date(),
          exerciseId: exerciseId,
          hasBeenTyped: false, // New messages should be typed
          isCurrentlyTyping: false // Will be set to true by the typing queue
        }

        const finalExercises = updatedExercises.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, messages: [...ex.messages, aiMessage], isLoading: false }
            : ex
        )

        // Detect new vocabulary terms
        const detectedTerms = vocabularyTerms
          .filter(vocab => responseContent.includes(vocab.term))
          .map(vocab => vocab.term)
        
        if (detectedTerms.length > 0) {
          setNewTerms(prev => [...prev, ...detectedTerms])
        }

        setTimeout(scrollToBottom, 100)

        // Create sub-exercise if needed - use a timeout to ensure the AI message is displayed first
        if (shouldCreateSubExercise) {
          // Check if sub-exercise creation is already in progress
          if (!subExerciseCreationInProgress.current.has(exerciseId)) {
            subExerciseCreationInProgress.current.add(exerciseId)
            
            setTimeout(() => {
              createSubExercise(exerciseId)
            }, 2000) // Wait for AI response to finish typing
          }
        }
        
        // Handle exercise completion
        if (isCompleted && responseContent.includes('<EXERCISE_COMPLETE>')) {
          setTimeout(() => {
            // Mark current exercise as completed
            setExercises(prev => prev.map(ex => 
              ex.id === exerciseId 
                ? { ...ex, status: 'completed' }
                : ex
            ))
            
            // Create new advanced exercise after a delay
            setTimeout(() => {
              createAdvancedExercise()
            }, 2000)
          }, 3000)
        }
        
        return finalExercises
      })
    }, 2000)
  }

  // Create sub-exercise for specific exercise
  const createSubExercise = (exerciseId: string) => {
    
    // Check if already in progress
    if (!subExerciseCreationInProgress.current.has(exerciseId)) {
      return
    }
    
    // Check if remediation message already exists
    const currentExercise = exercises.find(ex => ex.id === exerciseId)
    if (!currentExercise) {
      subExerciseCreationInProgress.current.delete(exerciseId)
      return
    }
    
    const hasRemediation = currentExercise.messages.some(msg => 
      msg.content.includes('I see your logic in Step 2')
    )
    
    if (hasRemediation) {
      subExerciseCreationInProgress.current.delete(exerciseId)
      return
    }

    // First add the remediation explanation
    const remediationMessage: ChatMessage = {
      id: `remediation-${Date.now()}-${Math.random()}`,
      type: 'system',
      content: mockFeedbackResponses[1].content,
      timestamp: new Date(),
      exerciseId: exerciseId,
      isSubExercise: true,
      subExerciseLevel: 1,
      hasBeenTyped: false, // Should be typed
      isCurrentlyTyping: false // Will be set to true by the typing queue
    }

    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, messages: [...ex.messages, remediationMessage] }
        : ex
    ))

    // Then add the sub-exercise after a delay
    setTimeout(() => {
      setExercises(prev => {
        const currentEx = prev.find(ex => ex.id === exerciseId)
        if (!currentEx) {
          return prev
        }
        
        // Check if sub-exercise already exists
        const hasSubExercise = currentEx.messages.some(msg => 
          msg.content.includes('Sub-Exercise: Let\'s practice')
        )
        
        if (hasSubExercise) {
          return prev
        }
        
        const subExerciseMessage: ChatMessage = {
          id: `sub-${Date.now()}-${Math.random()}`,
          type: 'system',
          content: mockFeedbackResponses[2].content,
          timestamp: new Date(),
          exerciseId: exerciseId,
          isSubExercise: true,
          subExerciseLevel: 1,
          hasBeenTyped: false, // Should be typed
          isCurrentlyTyping: false // Will be set to true by the typing queue
        }

        const updatedExercises = prev.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, messages: [...ex.messages, subExerciseMessage] }
            : ex
        )

        // Detect new vocabulary terms in sub-exercise
        const detectedTerms = vocabularyTerms
          .filter(vocab => subExerciseMessage.content.includes(vocab.term))
          .map(vocab => vocab.term)
        
        if (detectedTerms.length > 0) {
          setNewTerms(prev => [...prev, ...detectedTerms])
        }

        setTimeout(scrollToBottom, 100)
        return updatedExercises
      })
      
      // Clear the in-progress flag
      subExerciseCreationInProgress.current.delete(exerciseId)
    }, 2000)

    setTimeout(scrollToBottom, 100)
  }

  // Toggle expansion for specific exercise
  const toggleExerciseExpansion = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, isExpanded: !ex.isExpanded } : ex
    ))
  }

  // Create advanced exercise
  const createAdvancedExercise = () => {
    const exerciseId = `exercise-${Date.now()}`
    const advancedExercise: Exercise = {
      id: exerciseId,
      title: 'Advanced Two-Step Equations',
      status: 'active',
      currentInput: '',
      isLoading: false,
      isTyping: false,
      isExpanded: true,
      messages: [
        {
          id: 'adv-msg-1',
          type: 'system',
          content: 'Great work on the basic exercise! Now let\'s try a more complex problem.',
          timestamp: new Date(),
          exerciseId: exerciseId,
          hasBeenTyped: false, // New messages should be typed
          isCurrentlyTyping: false // Will be set to true by the typing queue
        },
        {
          id: 'adv-msg-2',
          type: 'system',
          content: 'Problem: You are ordering custom t-shirts for a club. The company charges a $40 setup fee for the design. Each shirt costs $8. You also have a coupon for $10 off your entire order. If your final bill is $110, how many shirts (s) did you order?\n\nAdded Complexity: This problem introduces a third number that must be correctly applied before solving. The student must realize that the coupon reduces the total cost before they start solving for the number of shirts, requiring them to combine the constants first (40 - 10).',
          timestamp: new Date(),
          exerciseId: exerciseId,
          hasBeenTyped: false, // New messages should be typed
          isCurrentlyTyping: false // Will be set to true by the typing queue
        }
      ]
    }

    setExercises(prev => [...prev, advancedExercise])
    setTimeout(scrollToBottom, 100)
  }

  // Handle hint for specific exercise
  const handleHint = (exerciseId: string) => {
    setShowHint(true)
    const hintMessage: ChatMessage = {
      id: `hint-${Date.now()}`,
      type: 'system',
      content: 'Think about what we said earlier about the reverse order of operations. What comes first when you\'re "undoing" operations?',
      timestamp: new Date(),
      exerciseId: exerciseId,
      hasBeenTyped: false, // Should be typed
      isCurrentlyTyping: false // Will be set to true by the typing queue
    }

    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, messages: [...ex.messages, hintMessage] }
        : ex
    ))

    setTimeout(scrollToBottom, 100)
  }

  // Handle keyboard shortcuts for specific exercise
  const handleKeyDown = (e: React.KeyboardEvent, exerciseId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(exerciseId)
    }
  }

  // Handle input change for specific exercise
  const handleInputChange = (exerciseId: string, value: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, currentInput: value } : ex
    ))
  }

  return (
    <div className="chat-exercise-container">
      <div className={cn("w-full mt-8 space-y-4 relative", className)}>
        {/* Jump to Exercise Button */}
        {jumpToExerciseVisible && (
          <div className="fixed bottom-4 right-4 z-20">
            <Button
              onClick={jumpToLatestExercise}
              className="bg-[#4FD1C5] hover:bg-[#38B2AC] text-white shadow-lg"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Jump to Exercise
            </Button>
          </div>
        )}

        {/* Vocabulary Drawer */}
        <VocabularyDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          newTerms={newTerms}
          onClearNewTerms={() => {
            setNewTerms([])
            setDrawerOpen(true)
          }}
        />

        {/* Render all exercises */}
        {exercises.map((exercise) => (
          <div key={exercise.id} className="relative">
            <Card className="bg-[#3a3a3a] border-[#4a4a47] overflow-visible">
              <CardContent className="p-0">
                {/* Header with sticky positioning when expanded */}
                <div 
                  className={cn(
                    "flex items-center justify-between p-6 cursor-pointer z-20",
                    "bg-gradient-to-r from-[#3a3a3a] to-[#353535] hover:from-[#454545] hover:to-[#454545] transition-all duration-200",
                    "border-l-4",
                    exercise.isExpanded ? "rounded-t-lg border-b border-[#4a4a47] sticky top-4" : "rounded-lg",
                    exercise.status === 'active' && "border-l-blue-500",
                    exercise.status === 'completed' && "border-l-green-500",
                    exercise.status === 'collapsed' && "border-l-green-500"
                  )}
                  style={{
                    ...(exercise.isExpanded && {
                      backgroundColor: '#3a3a3a',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    })
                  }}
                  onClick={() => toggleExerciseExpansion(exercise.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-semibold text-white">{exercise.title}</h2>
                    <div className="flex items-center gap-1">
                      {/* Vocabulary Terms Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDrawerOpen(true)
                          }}
                          onMouseEnter={() => handleButtonTooltip('vocab', true)}
                          onMouseLeave={() => handleButtonTooltip('vocab', false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-[#373737] border border-transparent hover:border-gray-600/50 transition-all duration-200 group"
                        >
                          <span className="text-sm font-medium text-[#4FD1C5] group-hover:text-[#5FE1D5]">
                            {vocabularyCount}
                          </span>
                          <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                        </button>
                        {buttonTooltips.vocab && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#373737] border border-[#4a4a47] rounded text-sm text-white whitespace-nowrap">
                            Vocab
                          </div>
                        )}
                      </div>
                      
                      {/* Equations Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDrawerOpen(true)
                          }}
                          onMouseEnter={() => handleButtonTooltip('equations', true)}
                          onMouseLeave={() => handleButtonTooltip('equations', false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-[#373737] border border-transparent hover:border-gray-600/50 transition-all duration-200 group"
                        >
                          <span className="text-sm font-medium text-[#805AD5] group-hover:text-[#9F7AEA]">
                            {equationCount}
                          </span>
                          <Sigma className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                        </button>
                        {buttonTooltips.equations && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#373737] border border-[#4a4a47] rounded text-sm text-white whitespace-nowrap">
                            Formulas
                          </div>
                        )}
                      </div>
                      
                      {/* Concepts Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDrawerOpen(true)
                          }}
                          onMouseEnter={() => handleButtonTooltip('concepts', true)}
                          onMouseLeave={() => handleButtonTooltip('concepts', false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent hover:bg-[#373737] border border-transparent hover:border-gray-600/50 transition-all duration-200 group"
                        >
                          <span className="text-sm font-medium text-[#ED64A6] group-hover:text-[#F687B3]">
                            {conceptCount}
                          </span>
                          <Brain className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                        </button>
                        {buttonTooltips.concepts && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#373737] border border-[#4a4a47] rounded text-sm text-white whitespace-nowrap">
                            Concepts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Chevron Icon */}
                  <div className="ml-4 p-2 rounded-full hover:bg-[#363636]/50 transition-colors duration-200">
                    {exercise.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Content - only show when expanded */}
                {exercise.isExpanded && (
                  <div className="border-t border-[#4a4a47]">
                    {/* Collapsed Exercise Summary */}
                    {exercise.status === 'collapsed' && (
                      <div className="p-6 text-gray-400">
                        <p className="text-sm">
                          🎉 Exercise completed - You successfully mastered two-step linear equations!
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-[#4FD1C5] hover:text-[#5FE1D5]"
                          onClick={() => setExercises(prev => prev.map(ex => 
                            ex.id === exercise.id ? { ...ex, status: 'completed' } : ex
                          ))}
                        >
                          View Full Exercise
                        </Button>
                      </div>
                    )}

                    {/* Chat Container - only for active and completed exercises */}
                    {(exercise.status === 'active' || exercise.status === 'completed') && (
                      <div 
                        ref={exercise.status === 'active' ? chatContainerRef : null}
                        className="p-6 space-y-4"
                      >
                        {exercise.messages.map((message, index) => {
                          const isSubExercise = message.isSubExercise
                          const prevMessage = exercise.messages[index - 1]
                          const nextMessage = exercise.messages[index + 1]
                          const isPrevSubExercise = prevMessage?.isSubExercise
                          const isNextSubExercise = nextMessage?.isSubExercise
                          
                          // Only show the threading line on the first sub-exercise in a sequence
                          const isFirstInSubExerciseSequence = isSubExercise && !isPrevSubExercise
                          
                          // Calculate how many consecutive sub-exercises follow this one
                          let consecutiveSubExercises = 0
                          if (isFirstInSubExerciseSequence) {
                            for (let i = index; i < exercise.messages.length && exercise.messages[i]?.isSubExercise; i++) {
                              const msg = exercise.messages[i]
                              // Only count messages that are visible (student messages, currently typing, or already typed)
                              if (msg.type === 'student' || msg.isCurrentlyTyping || msg.hasBeenTyped) {
                                consecutiveSubExercises++
                              }
                            }
                          }
                          
                          return (
                            <div key={message.id} className="space-y-2">
                              {/* Message with threading */}
                              <div className={cn(
                                "flex relative",
                                message.type === 'student' ? "justify-end" : "justify-start"
                              )}>
                                {/* Single continuous vertical line for the entire sub-exercise sequence */}
                                {isFirstInSubExerciseSequence && (
                                  <div 
                                    className="absolute left-2 w-0.5 bg-gray-400/30"
                                    style={{
                                      top: 0,
                                      height: consecutiveSubExercises === 1 
                                        ? '70%' 
                                        : `calc(${(consecutiveSubExercises - 0.4) * 100}% + ${(consecutiveSubExercises - 1) * 0.7}rem)`
                                    }}
                                  />
                                )}
                                
                                {/* Only render message if it's a student message, currently typing, or has been typed */}
                                {(message.type === 'student' || message.isCurrentlyTyping || message.hasBeenTyped) && (
                                  <div className={cn(
                                    "rounded-lg px-4 py-3 relative",
                                    message.type === 'student' 
                                      ? "bg-[#525252] border border-[#606060] text-white ml-auto min-w-[60%] max-w-[85%]" 
                                      : "bg-[#3c5552]/100 text-white max-w-[95%]",
                                    isSubExercise && "ml-6"
                                  )}>
                                    <div className="leading-relaxed whitespace-pre-wrap">
                                      {message.type === 'system' && message.isCurrentlyTyping ? (
                                        <TypingMessage
                                          content={message.content}
                                          speed={100}
                                          parseVocabulary={parseVocabularyTerms}
                                          onComplete={() => {
                                            // Mark message as typed and not currently typing
                                            setExercises(prev => prev.map(ex => 
                                              ex.id === exercise.id 
                                                ? {
                                                    ...ex,
                                                    messages: ex.messages.map(msg => 
                                                      msg.id === message.id 
                                                        ? { ...msg, hasBeenTyped: true, isCurrentlyTyping: false }
                                                        : msg
                                                    )
                                                  }
                                                : ex
                                            ))
                                          }}
                                        />
                                      ) : message.type === 'system' && !message.hasBeenTyped ? (
                                        // Don't show messages that haven't been typed yet
                                        null
                                      ) : message.type === 'system' ? (
                                        <FormattedMessage content={message.content} parseVocabulary={parseVocabularyTerms} />
                                      ) : (
                                        message.content
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* Typing Indicator - only for this exercise */}
                        {exercise.isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-[#454545] border border-[#4a4a47] rounded-lg px-4 py-3">
                              <TypingIndicator />
                            </div>
                          </div>
                        )}

                        {/* Input Area - only for active exercise */}
                        {exercise.status === 'active' && (
                          <div className="mt-4 pt-4">
                            <div className="relative">
                              <Textarea
                                ref={(el) => { inputRefs.current[exercise.id] = el }}
                                value={exercise.currentInput || ''}
                                onChange={(e) => handleInputChange(exercise.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, exercise.id)}
                                placeholder="Explain your step-by-step approach..."
                                className="min-h-[100px] resize-none pr-20 bg-[#454545] border-[#4a4a47] text-white placeholder:text-gray-400 focus:border-[#6b6b6b] focus:ring-0 custom-scrollbar overflow-auto"
                                disabled={exercise.isLoading}
                              />
                              
                              {/* Hint Button - Top Right Overlay */}
                              <div className="absolute top-2 right-2 z-10">
                                <Button
                                  onClick={() => handleHint(exercise.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                                  onMouseEnter={() => {
                                    const timer = setTimeout(() => {
                                      setShowHintTooltip(true)
                                    }, 500)
                                    setHintTooltipTimer(timer)
                                  }}
                                  onMouseLeave={() => {
                                    if (hintTooltipTimer) {
                                      clearTimeout(hintTooltipTimer)
                                    }
                                    setShowHintTooltip(false)
                                  }}
                                >
                                  <Lightbulb className="w-9 h-9 font-bold" strokeWidth={3} />
                                </Button>
                                
                                {/* Tooltip */}
                                {showHintTooltip && (
                                  <div className="absolute bottom-[34px] right-0 bg-[#505050] border border-[#6a6a6a] text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    Need help?
                                  </div>
                                )}
                              </div>
                              
                              {/* Send Button - Bottom Right */}
                              <Button
                                onClick={() => handleSendMessage(exercise.id)}
                                disabled={exercise.isLoading || !exercise.currentInput?.trim()}
                                className="absolute right-2 bottom-2 h-8 w-12 p-0 bg-[#3a3a3a] hover:bg-[#4FD1C5]/10 hover:border-[#618c7f] border-2 border-transparent text-white transition-colors"
                              >
                                {exercise.isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              Press Enter to send, Shift+Enter for new line
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
} 