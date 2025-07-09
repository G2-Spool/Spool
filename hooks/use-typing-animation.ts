import { useState, useEffect, useRef } from 'react'

interface UseTypingAnimationOptions {
  text: string
  speed?: number // characters per second
  startDelay?: number // delay before starting animation
  onComplete?: () => void
}

export function useTypingAnimation({
  text,
  speed = 50, // 50 characters per second
  startDelay = 0,
  onComplete
}: UseTypingAnimationOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()

  const startTyping = () => {
    if (!text || text.length === 0) {
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsTyping(true)
    setIsComplete(false)

    // Start delay
    timeoutRef.current = setTimeout(() => {
      let currentIndex = 0
      
      intervalRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          // Animation complete
          clearInterval(intervalRef.current!)
          setIsTyping(false)
          setIsComplete(true)
          onComplete?.()
        }
      }, 1000 / speed) // Convert speed to milliseconds per character
    }, startDelay)
  }

  const skipAnimation = () => {
    // Clear any ongoing animation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Show full text immediately
    setDisplayedText(text)
    setIsTyping(false)
    setIsComplete(true)
    onComplete?.()
  }

  const resetAnimation = () => {
    // Clear any ongoing animation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    setDisplayedText('')
    setIsTyping(false)
    setIsComplete(false)
  }

  // Start animation when text changes
  useEffect(() => {
    if (text) {
      startTyping()
    }

    // Cleanup on unmount or text change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text, speed, startDelay])

  return {
    displayedText,
    isTyping,
    isComplete,
    skipAnimation,
    resetAnimation,
    startTyping
  }
} 