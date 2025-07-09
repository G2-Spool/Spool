import React from 'react'
import { ChatMessage as ChatMessageType } from '@/services/chat'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, Award, User, Bot, AlertCircle } from 'lucide-react'
import { useTypingAnimation } from '@/hooks/use-typing-animation'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  className?: string
  enableTyping?: boolean
}

export function ChatMessage({ message, className, enableTyping = true }: ChatMessageProps) {
  const isUser = message.type === 'user'
  const isAssistant = message.type === 'assistant'
  const isSystem = message.type === 'system'

  // Use typing animation for new assistant and system messages
  const shouldAnimate = (isAssistant || isSystem) && enableTyping && message.metadata?.isNewMessage
  
  const { displayedText, isTyping, skipAnimation } = useTypingAnimation({
    text: message.content,
    speed: 40, // Slightly slower for readability
    startDelay: shouldAnimate ? 300 : 0, // Small delay for assistant messages
  })

  // Show typing animation only for new assistant messages, otherwise show full text
  const contentToShow = shouldAnimate ? displayedText : message.content

  const getMessageIcon = () => {
    if (isUser) return <User className="w-4 h-4" />
    if (isSystem) return <AlertCircle className="w-4 h-4" />
    return <Bot className="w-4 h-4" />
  }

  const getMessageBubbleStyles = () => {
    if (isUser) {
      return "bg-primary text-primary-foreground ml-12 rounded-br-sm"
    }
    if (isSystem) {
      return "bg-muted text-foreground mr-12 rounded-bl-sm border-l-4 border-primary"
    }
    return "bg-muted text-foreground mr-12 rounded-bl-sm"
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(timestamp)
  }

  return (
    <div className={cn("flex flex-col gap-2 max-w-[80%]", 
      isUser ? "self-end" : "self-start", 
      className
    )}>
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg",
        getMessageBubbleStyles()
      )}>
        {!isUser && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
            {getMessageIcon()}
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          {/* Message content */}
          <div className="prose prose-sm max-w-none">
            <p 
              className="whitespace-pre-wrap leading-relaxed cursor-pointer"
              onClick={isTyping ? skipAnimation : undefined}
              title={isTyping ? "Click to skip animation" : undefined}
            >
              {contentToShow}
              {isTyping && (
                <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
              )}
            </p>
          </div>
          
          {/* Assignment metadata */}
          {message.metadata?.isAssignment && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Clock className="w-3 h-3 mr-1" />
                Assignment
              </Badge>
              
              {message.metadata.isComplete && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Check className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
              
              {message.metadata.grade !== undefined && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Award className="w-3 h-3 mr-1" />
                  Grade: {Math.round(message.metadata.grade * 100)}%
                </Badge>
              )}
            </div>
          )}
          
          {/* System message metadata */}
          {isSystem && message.metadata?.isGraded && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Award className="w-3 h-3 mr-1" />
                Final Grade: {message.metadata.grade ? Math.round(message.metadata.grade * 100) : 'N/A'}%
              </Badge>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            {getMessageIcon()}
          </div>
        )}
      </div>
      
      {/* Timestamp */}
      <div className={cn(
        "text-xs text-muted-foreground px-2",
        isUser ? "text-right" : "text-left"
      )}>
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  )
} 