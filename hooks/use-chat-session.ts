import { useState, useEffect, useCallback } from 'react'
import { chatService, ChatMessage, AssessmentSession, ChatResponse } from '@/services/chat'
import { useAuth } from '@/contexts/auth-context'

export interface UseChatSessionProps {
  conceptId: string
  conceptTitle?: string
  onSessionComplete?: (summary: any) => void
}

export interface UseChatSessionReturn {
  session: AssessmentSession | null
  messages: ChatMessage[]
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  completeSession: () => Promise<void>
  clearError: () => void
}

export function useChatSession({ 
  conceptId, 
  conceptTitle, 
  onSessionComplete 
}: UseChatSessionProps): UseChatSessionReturn {
  const { user } = useAuth()
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize assessment session
  const initializeSession = useCallback(async () => {
    if (!user || !conceptId) return
    
    setIsInitializing(true)
    setError(null)
    
    try {
      const response = await chatService.initializeAssessment({
        conceptId,
        studentId: user.sub,
        conceptTitle
      })
      
      const initialMessage: ChatMessage = {
        id: `msg_${Date.now()}_initial`,
        type: 'assistant',
        content: response.initialMessage,
        timestamp: new Date(),
        metadata: {
          isAssignment: false,
          isGraded: false,
          isComplete: false,
          isNewMessage: true // Enable typing for initial message too
        }
      }
      
      const newSession: AssessmentSession = {
        sessionId: response.sessionId,
        conceptId,
        status: 'active',
        messages: [initialMessage]
      }
      
      setSession(newSession)
      setMessages([initialMessage])
      
    } catch (error) {
      console.error('Failed to initialize assessment session:', error)
      setError('Failed to start the learning session. Please try again.')
    } finally {
      setIsInitializing(false)
    }
  }, [user, conceptId, conceptTitle])

  // Send message to chat
  const sendMessage = useCallback(async (message: string) => {
    if (!session || !user || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    try {
      const response = await chatService.sendChatMessage({
        sessionId: session.sessionId,
        message,
        messageType: 'response'
      })
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          isAssignment: response.metadata?.isAssignment || false,
          isGraded: response.metadata?.isGraded || false,
          grade: response.metadata?.grade,
          isComplete: response.metadata?.isComplete || false,
          assignmentId: response.metadata?.assignmentId,
          isNewMessage: true // Mark as new for typing animation
        }
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Update session state
      setSession(prev => {
        if (!prev) return null
        
        const updatedSession = {
          ...prev,
          messages: [...prev.messages, userMessage, assistantMessage]
        }
        
        // Handle assignment updates
        if (response.metadata?.isAssignment) {
          updatedSession.currentAssignment = {
            id: response.metadata.assignmentId || `assignment_${Date.now()}`,
            prompt: response.message,
            isComplete: response.metadata.isComplete || false,
            grade: response.metadata.grade
          }
        }
        
        // Handle session completion
        if (response.messageType === 'completion') {
          updatedSession.status = 'completed'
        }
        
        return updatedSession
      })
      
      // Auto-complete session if indicated
      if (response.messageType === 'completion') {
        await completeSession()
      }
      
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [session, user, isLoading])

  // Complete assessment session
  const completeSession = useCallback(async () => {
    if (!session) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await chatService.completeAssessment({
        sessionId: session.sessionId,
        completionReason: 'finished'
      })
      
      // Add completion message
      const completionMessage: ChatMessage = {
        id: `msg_${Date.now()}_completion`,
        type: 'system',
        content: response.summary,
        timestamp: new Date(),
        metadata: {
          isAssignment: false,
          isGraded: true,
          grade: response.finalGrade,
          isComplete: true,
          isNewMessage: true // Enable typing for completion message
        }
      }
      
      setMessages(prev => [...prev, completionMessage])
      
      setSession(prev => prev ? { ...prev, status: 'completed' } : null)
      
      // Notify parent component
      if (onSessionComplete) {
        onSessionComplete(response)
      }
      
    } catch (error) {
      console.error('Failed to complete session:', error)
      setError('Failed to complete the session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [session, onSessionComplete])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (user && conceptId) {
      initializeSession()
    }
  }, [user, conceptId, initializeSession])

  return {
    session,
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    completeSession,
    clearError
  }
} 