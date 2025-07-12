import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Send, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudyStreak } from '@/hooks/use-study-streak'
import { ChatExerciseInterface } from '@/components/learning/chat-exercise-interface'

// Animation Components
const ThoughtBubble = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm text-white">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-[#3c5552]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-[#3c5552]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-[#3c5552]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

export function ExerciseSection({ conceptId, conceptTitle, topicId }: ExerciseSectionProps) {
  return (
    <div className="chat-exercise-container">
      <ChatExerciseInterface 
        conceptId={conceptId}
        conceptTitle={conceptTitle}
        topicId={topicId}
      />
    </div>
  )
}

// Extend window type for MathJax
declare global {
  interface Window {
    MathJax?: any
  }
} 