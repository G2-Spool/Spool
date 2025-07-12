"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface TypingMessageProps {
  content: string
  speed?: number // characters per second
  onComplete?: () => void
  parseVocabulary?: (text: string) => React.ReactNode
  className?: string
}

// Segment types for parsing
interface ContentSegment {
  type: 'text' | 'latex-inline' | 'latex-block' | 'markdown'
  content: string
  raw: string
}

export function TypingMessage({ 
  content, 
  speed = 80, 
  onComplete,
  parseVocabulary,
  className 
}: TypingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  // Parse content into segments
  const segments = useMemo(() => {
    const segs: ContentSegment[] = []
    let remaining = content
    let position = 0

    while (remaining.length > 0) {
      // Check for block LaTeX ($$...$$)
      const blockLatexMatch = remaining.match(/^\$\$([\s\S]*?)\$\$/)
      if (blockLatexMatch) {
        const [fullMatch, equation] = blockLatexMatch
        segs.push({
          type: 'latex-block',
          content: equation,
          raw: fullMatch
        })
        remaining = remaining.slice(fullMatch.length)
        position += fullMatch.length
        continue
      }

      // Check for inline LaTeX ($...$)
      const inlineLatexMatch = remaining.match(/^\$([^\$\n]+)\$/)
      if (inlineLatexMatch) {
        const [fullMatch, equation] = inlineLatexMatch
        segs.push({
          type: 'latex-inline',
          content: equation,
          raw: fullMatch
        })
        remaining = remaining.slice(fullMatch.length)
        position += fullMatch.length
        continue
      }

      // Find next special character or pattern
      const nextSpecial = remaining.search(/\$|\*|<[^>]+>/)
      
      if (nextSpecial === -1) {
        // Rest is plain text
        if (remaining.length > 0) {
          segs.push({
            type: 'text',
            content: remaining,
            raw: remaining
          })
        }
        break
      } else if (nextSpecial > 0) {
        // Add text before special character
        segs.push({
          type: 'text',
          content: remaining.slice(0, nextSpecial),
          raw: remaining.slice(0, nextSpecial)
        })
        remaining = remaining.slice(nextSpecial)
        position += nextSpecial
      } else {
        // Handle markdown or move one character forward
        const char = remaining[0]
        segs.push({
          type: 'text',
          content: char,
          raw: char
        })
        remaining = remaining.slice(1)
        position += 1
      }
    }

    return segs
  }, [content])

  // Calculate what to display based on current position
  const getDisplayContent = () => {
    let result = ''
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      
      if (i < currentSegmentIndex) {
        // Full segment already typed
        result += segment.raw
      } else if (i === currentSegmentIndex) {
        // Currently typing this segment
        if (segment.type === 'latex-inline' || segment.type === 'latex-block') {
          // Show LaTeX equations all at once when reached
          if (currentCharIndex > 0) {
            result += segment.raw
          }
        } else {
          // Type out text character by character
          result += segment.raw.slice(0, currentCharIndex)
        }
      }
      // Segments after current are not shown
    }
    
    return result
  }

  // Typing animation effect
  useEffect(() => {
    if (isComplete || segments.length === 0) return

    const msPerChar = 1000 / speed

    intervalRef.current = setInterval(() => {
      const currentSegment = segments[currentSegmentIndex]
      
      if (!currentSegment) {
        // Animation complete
        setIsComplete(true)
        clearInterval(intervalRef.current)
        onComplete?.()
        return
      }

      if (currentSegment.type === 'latex-inline' || currentSegment.type === 'latex-block') {
        // Show LaTeX equations all at once
        setCurrentCharIndex(1) // Mark as shown
        setTimeout(() => {
          // Move to next segment after a brief pause
          setCurrentSegmentIndex(prev => prev + 1)
          setCurrentCharIndex(0)
        }, 200) // 200ms pause after equation
      } else {
        // Type out text character by character
        if (currentCharIndex < currentSegment.raw.length) {
          setCurrentCharIndex(prev => prev + 1)
        } else {
          // Move to next segment
          setCurrentSegmentIndex(prev => prev + 1)
          setCurrentCharIndex(0)
        }
      }
    }, msPerChar)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentSegmentIndex, currentCharIndex, segments, speed, isComplete, onComplete])

  // Render the content with proper formatting
  const renderContent = () => {
    const displayContent = getDisplayContent()
    
    // We should NOT apply parseVocabulary inside markdown components
    // Instead, let's render markdown first, then apply vocabulary parsing
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
        {displayContent}
      </ReactMarkdown>
    )
  }

  return (
    <div className={cn("typing-message", className)}>
      {renderContent()}
      {!isComplete && (
        <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-0.5" />
      )}
    </div>
  )
} 