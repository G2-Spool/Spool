import React, { useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ChatMessage as ChatMessageType } from '@/services/chat'
import { AlertCircle, RefreshCw, X, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatContainerProps {
  messages: ChatMessageType[]
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
  isInitializing?: boolean
  error?: string | null
  onClearError?: () => void
  onCompleteSession?: () => Promise<void>
  sessionStatus?: 'active' | 'completed' | 'paused'
  className?: string
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  isInitializing = false,
  error,
  onClearError,
  onCompleteSession,
  sessionStatus = 'active',
  className
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Loading state during initialization
  if (isInitializing) {
    return (
      <div className={cn("h-full flex flex-col bg-card border border-border rounded-lg", className)}>
        <div className="flex-1 flex items-center justify-center p-8 bg-background rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Starting your learning session...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn("h-full flex flex-col bg-card border border-border rounded-lg", className)}>
        <div className="flex-1 flex items-center justify-center p-8 bg-background rounded-lg">
          <Alert variant="destructive" className="max-w-md bg-card border border-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearError}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  const isSessionComplete = sessionStatus === 'completed'
  const canSendMessage = !isLoading && !isInitializing && !isSessionComplete

  return (
    <div className={cn("h-full flex flex-col bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <h3 className="font-semibold text-foreground">
              {isSessionComplete ? 'Learning Session Complete' : 'AI Tutor'}
            </h3>
          </div>
          
          {sessionStatus === 'active' && onCompleteSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCompleteSession}
              className="text-muted-foreground hover:text-foreground"
            >
              End Session
            </Button>
          )}
        </div>
        
        {/* Session status */}
        <div className="mt-2 text-sm text-muted-foreground">
          {isSessionComplete ? (
            'Review your session results below'
          ) : (
            `${messages.length} message${messages.length !== 1 ? 's' : ''} • Active session`
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="bg-muted rounded-lg p-6 mx-4 border border-border shadow-sm">
              <Bot className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Your AI tutor is ready to help you learn!</p>
              <p className="text-sm mt-2 text-muted-foreground">The session will begin automatically...</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              enableTyping={true}
            />
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-muted-foreground p-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">AI Tutor is thinking...</span>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {canSendMessage && (
        <ChatInput
          onSendMessage={onSendMessage}
          loading={isLoading}
          disabled={isSessionComplete}
          placeholder="Type your response here..."
        />
      )}
      
      {/* Session complete message */}
      {isSessionComplete && (
        <div className="p-4 bg-muted border-t border-border rounded-b-lg">
          <div className="flex items-center gap-2 text-primary">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Session Complete!</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Great work! Review your results above and continue with your learning path.
          </p>
        </div>
      )}
    </div>
  )
} 