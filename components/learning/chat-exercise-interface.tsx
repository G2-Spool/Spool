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
  AlertCircle
} from 'lucide-react'
import { useStudyStreak } from '@/hooks/use-study-streak'

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
    messages: [
      {
        id: 'msg-1',
        type: 'system',
        content: 'Let\'s practice solving two-step equations! I\'ll guide you through this step by step.',
        timestamp: new Date(),
        exerciseId: 'exercise-1'
      },
      {
        id: 'msg-2',
        type: 'system',
        content: 'Problem: You want to join a gym. The gym charges a one-time $20 sign-up fee and then $15 per month. You have a total budget of $80 to spend. Write and solve an equation to find out how many months (m) you can be a member.\n\nExplain each step of your thought process.',
        timestamp: new Date(),
        exerciseId: 'exercise-1'
      }
    ]
  }
]

// Mock data for the student's first attempt (with errors)
const mockStudentFirstAttempt = `Step 1: "The equation for the cost is 15m + 20. The total budget is $80. So, 15m + 20 = 80."

Step 2: "My goal is to get m by itself. First I will get rid of the 15 that is multiplied by m."

Step 3: "To do this, I will divide both sides by 15. 15m / 15 + 20 = 80 / 15."

Step 4: "This gives m + 20 = 5.33. This doesn't seem right."`

// Mock feedback responses
const mockFeedbackResponses = [
  {
    id: 'feedback-1',
    content: 'Evaluation Complete.\n\nStep 1: ✅ Correctly formulated equation.\n\nStep 2: ❌ Incorrect order of operations.\n\nStep 3: ❌ Incorrect application of division.\n\nStep 4: ❌ Incorrect result.\n\nSending articulated Step 2 to remediation AI...'
  },
  {
    id: 'remediation-1',
    content: 'I see your logic in Step 2 was to "get rid of the 15 first." Let\'s look at the Workflow section again.\n\nWorkflow Step 2 is "Undo Addition/Subtraction" and Step 3 is "Undo Multiplication/Division." You tried to do multiplication/division first. Remember the "getting dressed" mental model: you have to undo things in the reverse order.',
    isSubExercise: true
  },
  {
    id: 'sub-exercise-1',
    content: 'Sub-Exercise: Let\'s practice that specific step. If you have the equation 10x + 4 = 24, what is the very first thing you must do to both sides to follow the correct workflow?',
    isSubExercise: true
  }
]

// Vocabulary parsing function
const parseVocabularyTerms = (text: string): React.ReactNode => {
  let parsedText = text
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
         <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#3a3936] border border-[#4a4a47] rounded-lg shadow-lg max-w-xs">
           <p className="text-sm text-white leading-relaxed">{definition}</p>
           <div className="absolute top-full left-1/2 transform -translate-x-1/2">
             <div className="w-2 h-2 bg-[#3a3936] border-r border-b border-[#4a4a47] rotate-45"></div>
           </div>
         </div>
       )}
    </span>
  )
}

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
    <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
  </div>
)

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
              "bg-[#3a3936] border border-[#4a4a47] rounded-l-lg px-2 py-8 text-white text-sm font-medium transition-all duration-300",
              "hover:bg-[#3f3f3c] border-r-0 opacity-80"
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
                        "p-3 transition-all duration-300 hover:bg-[#3a3936]",
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
                        "p-3 transition-all duration-300 hover:bg-[#3a3936]",
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
                        "p-3 transition-all duration-300 hover:bg-[#3a3936]",
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

// Main component
export function ChatExerciseInterface({ 
  conceptId, 
  conceptTitle, 
  topicId, 
  className 
}: ChatExerciseInterfaceProps) {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises)
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newTerms, setNewTerms] = useState<string[]>([])
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null)
  const [jumpToExerciseVisible, setJumpToExerciseVisible] = useState(false)
  const [exerciseCompleted, setExerciseCompleted] = useState(false)
  const [collapseTimer, setCollapseTimer] = useState<NodeJS.Timeout | null>(null)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { recordCompletion } = useStudyStreak()

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

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // Jump to latest exercise
  const jumpToLatestExercise = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  // Handle sending student response
  const handleSendMessage = async () => {
    if (!currentInput.trim()) return

    setIsLoading(true)
    
    // Add student message
    const studentMessage: ChatMessage = {
      id: `student-${Date.now()}`,
      type: 'student',
      content: currentInput,
      timestamp: new Date(),
      exerciseId: exercises[0].id
    }

    setExercises(prev => prev.map(exercise => 
      exercise.id === exercises[0].id 
        ? { ...exercise, messages: [...exercise.messages, studentMessage] }
        : exercise
    ))

    // Clear input
    setCurrentInput('')
    
    // Show typing indicator
    setIsTyping(true)
    setTimeout(scrollToBottom, 100)

    // Simulate AI processing with realistic delays
    setTimeout(() => {
      setIsTyping(false)
      
      // Determine response based on conversation stage
      const currentExercise = exercises[0]
      const messageCount = currentExercise.messages.length
      
      let responseContent = ''
      let shouldCreateSubExercise = false
      
      // First response - feedback on initial attempt
      if (messageCount === 3) { // Initial problem + student response
        responseContent = mockFeedbackResponses[0].content
        shouldCreateSubExercise = true
      } 
      // Second response - remediation explanation
      else if (messageCount === 4) {
        responseContent = mockFeedbackResponses[1].content
        shouldCreateSubExercise = true
      }
      // Sub-exercise response
      else if (currentExercise.messages.some(msg => msg.isSubExercise)) {
        responseContent = 'Exactly! Now, apply that same logic to your original problem: 15m + 20 = 80.\n\nWhat should be the very first step?'
      }
      // Final response
      else {
        responseContent = 'Perfect! You correctly identified that we need to subtract 20 from both sides first. This gives us 15m = 60, and then dividing by 15 gives us m = 4.\n\nYou can be a member for 4 months! 🎉\n\nExercise completed! Moving to advanced practice...'
        setExerciseCompleted(true)
      }
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'system',
        content: responseContent,
        timestamp: new Date(),
        exerciseId: exercises[0].id,
        isTyping: true
      }

      setExercises(prev => prev.map(exercise => 
        exercise.id === exercises[0].id 
          ? { ...exercise, messages: [...exercise.messages, aiMessage] }
          : exercise
      ))

      // Detect new vocabulary terms
      const detectedTerms = vocabularyTerms
        .filter(vocab => responseContent.includes(vocab.term))
        .map(vocab => vocab.term)
      
      if (detectedTerms.length > 0) {
        setNewTerms(prev => [...prev, ...detectedTerms])
      }

      setIsLoading(false)
      setTimeout(scrollToBottom, 100)

      // Create sub-exercise if needed
      if (shouldCreateSubExercise && messageCount === 3) {
        setTimeout(() => {
          createSubExercise()
        }, 3000)
      }
      
      // Auto-collapse and create new exercise if completed
      if (exerciseCompleted) {
        const timer = setTimeout(() => {
          // Mark current exercise as collapsed
          setExercises(prev => prev.map(exercise => 
            exercise.id === exercises[0].id 
              ? { ...exercise, status: 'collapsed' }
              : exercise
          ))
          
          // Create new advanced exercise
          createAdvancedExercise()
        }, 5000)
        
        setCollapseTimer(timer)
      }
    }, 2000)
  }

  // Create sub-exercise
  const createSubExercise = () => {
    const subExerciseMessage: ChatMessage = {
      id: `sub-${Date.now()}`,
      type: 'system',
      content: mockFeedbackResponses[2].content,
      timestamp: new Date(),
      exerciseId: exercises[0].id,
      isSubExercise: true,
      subExerciseLevel: 1
    }

    setExercises(prev => prev.map(exercise => 
      exercise.id === exercises[0].id 
        ? { ...exercise, messages: [...exercise.messages, subExerciseMessage] }
        : exercise
    ))

    // Detect new vocabulary terms in sub-exercise
    const detectedTerms = vocabularyTerms
      .filter(vocab => subExerciseMessage.content.includes(vocab.term))
      .map(vocab => vocab.term)
    
    if (detectedTerms.length > 0) {
      setNewTerms(prev => [...prev, ...detectedTerms])
    }

    setTimeout(scrollToBottom, 100)
  }

  // Create advanced exercise
  const createAdvancedExercise = () => {
    const advancedExercise: Exercise = {
      id: 'exercise-2',
      title: 'Advanced Two-Step Equations',
      status: 'active',
      messages: [
        {
          id: 'adv-msg-1',
          type: 'system',
          content: 'Great work on the basic exercise! Now let\'s try a more complex problem.',
          timestamp: new Date(),
          exerciseId: 'exercise-2'
        },
        {
          id: 'adv-msg-2',
          type: 'system',
          content: 'Problem: You are ordering custom t-shirts for a club. The company charges a $40 setup fee for the design. Each shirt costs $8. You also have a coupon for $10 off your entire order. If your final bill is $110, how many shirts (s) did you order?\n\nThis problem has an extra step - you need to account for the coupon that reduces the total cost.',
          timestamp: new Date(),
          exerciseId: 'exercise-2'
        }
      ]
    }

    setExercises(prev => [...prev, advancedExercise])
    setTimeout(scrollToBottom, 100)
  }

  // Handle hint
  const handleHint = () => {
    setShowHint(true)
    const hintMessage: ChatMessage = {
      id: `hint-${Date.now()}`,
      type: 'system',
      content: 'Think about what we said earlier about the reverse order of operations. What comes first when you\'re "undoing" operations?',
      timestamp: new Date(),
      exerciseId: exercises[0].id
    }

    setExercises(prev => prev.map(exercise => 
      exercise.id === exercises[0].id 
        ? { ...exercise, messages: [...exercise.messages, hintMessage] }
        : exercise
    ))

    setTimeout(scrollToBottom, 100)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

    // Get active exercise
  const activeExercise = exercises.find(ex => ex.status === 'active')

  return (
    <div className={cn("w-full mt-8 space-y-4", className)}>
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
         <Card key={exercise.id} className="bg-[#302f2c] border-[#4a4a47]">
          <CardContent className="p-0">
                         {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-[#4a4a47]">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">{exercise.title}</h2>
                                 <div className="flex items-center gap-2 text-sm text-gray-400">
                   {exercise.status === 'active' && <CheckCircle className="w-4 h-4" />}
                   {exercise.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                   {exercise.status === 'collapsed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                   <span className="capitalize">{exercise.status}</span>
                 </div>
              </div>
              
                             {exercise.status === 'active' && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setDrawerOpen(true)}
                   className="text-gray-400 hover:text-white"
                 >
                   View Terms
                 </Button>
               )}
            </div>

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
                  const nextMessage = exercise.messages[index + 1]
                  const isFollowedBySubExercise = nextMessage?.isSubExercise
                  
                  return (
                    <div key={message.id} className="space-y-2">
                      {/* Sub-exercise threading indicator */}
                      {isSubExercise && (
                        <div className="flex items-center gap-2 text-sm text-[#805AD5] ml-6">
                          <div className="w-8 h-0.5 bg-[#805AD5]"></div>
                          <span className="font-medium">Sub-Exercise</span>
                        </div>
                      )}

                      {/* Message with threading */}
                      <div className={cn(
                        "flex relative",
                        message.type === 'student' ? "justify-end" : "justify-start"
                      )}>
                        {/* Vertical threading line */}
                        {isSubExercise && (
                          <div className="absolute left-6 top-0 w-0.5 h-full bg-[#805AD5]/30" />
                        )}
                        
                                                 <div className={cn(
                           "max-w-[85%] rounded-lg px-4 py-3 relative",
                           message.type === 'student' 
                             ? "bg-[#4FD1C5] text-[#1a1a18] ml-auto" 
                             : "bg-[#3a3936] border border-[#4a4a47] text-white",
                           isSubExercise && "ml-12 border-l-4 border-[#805AD5]"
                         )}>
                          <div className="leading-relaxed">
                            {message.type === 'system' 
                              ? parseVocabularyTerms(message.content)
                              : message.content
                            }
                          </div>
                          
                          {/* Timestamp */}
                                                     <div className={cn(
                             "text-xs mt-2",
                             message.type === 'student' 
                               ? "text-[#1a1a18]/70 text-right" 
                               : "text-gray-400 text-left"
                           )}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>


                        </div>
                      </div>
                    </div>
                  )
                })}

                                 {/* Typing Indicator - only for active exercise */}
                 {exercise.status === 'active' && isTyping && (
                   <div className="flex justify-start">
                     <div className="bg-[#3a3936] border border-[#4a4a47] rounded-lg px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                {/* Input Area - only for active exercise */}
                {exercise.status === 'active' && (
                  <div className="mt-4 pt-4">
                    <div className="relative">
                      <Textarea
                        ref={inputRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Explain your step-by-step approach..."
                        className="min-h-[100px] resize-none pr-20 pt-12 bg-[#3a3936] border-[#4a4a47] text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-[#6b6b6b]"
                        disabled={isLoading}
                      />
                      
                      {/* Hint Button - Top Right */}
                      <Button
                        onClick={handleHint}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-yellow-400 hover:bg-transparent"
                      >
                        <Lightbulb className="w-6 h-6 font-bold" strokeWidth={3} />
                      </Button>
                      
                      {/* Send Button - Bottom Right */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !currentInput.trim()}
                        className="absolute right-2 bottom-2 h-8 w-12 p-0 bg-[#302f2c] hover:bg-[#4FD1C5]/10 hover:border-[#4FD1C5] border-2 border-transparent text-white transition-colors"
                      >
                        {isLoading ? (
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 