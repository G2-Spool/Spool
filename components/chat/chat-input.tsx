import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  loading = false, 
  placeholder = "Type your response here...",
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || disabled || loading || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSendMessage(message.trim())
      setMessage('')
      
      // Focus back on textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const isDisabled = disabled || loading || isSubmitting
  const showLoading = loading || isSubmitting

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <div className={cn("border-t border-border bg-muted rounded-b-lg", className)}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn(
              "min-h-[50px] max-h-[120px] resize-none pr-12 border-border",
              "bg-input text-foreground placeholder:text-muted-foreground",
              "focus:ring-2 focus:ring-ring focus:border-ring",
              "rounded-lg shadow-sm",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />
          
          {/* Send button positioned inside the textarea */}
          <Button
            type="submit"
            disabled={isDisabled || !message.trim() || message.length > 1000}
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 p-0",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "rounded-md shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            {showLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
          
          {/* Character count */}
          <div className="absolute bottom-2 left-3 text-xs text-muted-foreground">
            {message.length > 800 && `${message.length}/1000`}
          </div>
        </div>
      </form>
      
      {/* Helper text */}
      <div className="px-4 pb-2 text-xs text-muted-foreground rounded-b-lg">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
} 