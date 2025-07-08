"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, ChevronDown, ChevronRight, Send } from "lucide-react"
import { AssignmentModule } from "./types"
import { ModuleRenderer } from "./module-renderer"

interface AssignmentModuleProps {
  module: AssignmentModule
  onComplete?: (assignmentId: string, response: string) => void
  onUpdateResponse?: (assignmentId: string, response: string) => void
}

export function AssignmentModuleComponent({ 
  module, 
  onComplete, 
  onUpdateResponse 
}: AssignmentModuleProps) {
  const [isCollapsed, setIsCollapsed] = useState(module.isCollapsed || false)
  const [userInput, setUserInput] = useState(module.userResponse || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(module.isCompleted || false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsCollapsed(module.isCollapsed || false)
    setIsSubmitted(module.isCompleted || false)
  }, [module.isCollapsed, module.isCompleted])

  const handleSubmit = async () => {
    if (!userInput.trim()) return
    
    setIsSubmitting(true)
    try {
      await onComplete?.(module.id, userInput)
      // Mark as submitted but don't auto-collapse
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (value: string) => {
    setUserInput(value)
    onUpdateResponse?.(module.id, value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (userInput.trim() && !isSubmitting && !isSubmitted) {
        handleSubmit()
      }
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [userInput])

  return (
    <Card className="w-full bg-muted/30">
      <CardHeader className="pb-0 pt-3 bg-muted/10 rounded-t-lg border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-xl font-semibold flex items-center cursor-pointer flex-1"
            onClick={toggleCollapse}
          >
            <div className="flex items-center space-x-2">
              {module.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : isSubmitted ? (
                <div className="h-5 w-5 rounded-full bg-yellow-400 border-2 border-yellow-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-purple-300" />
              )}
              <span>Assignment: {module.title}</span>
              {isSubmitted && !module.isCompleted && (
                <span className="text-sm text-yellow-600 font-medium">• Submitted</span>
              )}
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted/50 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="pb-2" />
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-4">
          {/* Assignment description */}
          {module.description && (
            <p className="text-base text-muted-foreground mb-4">
              {module.description}
            </p>
          )}
          
          {/* Assignment content modules */}
          <div className="space-y-4 mb-6">
            {module.modules.map((subModule) => (
              <ModuleRenderer key={subModule.id} module={subModule} />
            ))}
          </div>
          
          {/* User input area */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <label htmlFor={`assignment-${module.id}`} className="block text-sm font-medium mb-2">
                Your Response:
              </label>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  id={`assignment-${module.id}`}
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your response here. You can use LaTeX notation like $x^2$ for math expressions..."
                  className={`min-h-[100px] resize-none overflow-hidden rounded-xl pr-12 pb-12 ${
                    isSubmitted && !module.isCompleted 
                      ? 'bg-muted/50 text-muted-foreground border-muted cursor-not-allowed' 
                      : ''
                  }`}
                  disabled={isSubmitted || module.isCompleted}
                />
                {/* Submit button inside text box */}
                {!isSubmitted && !module.isCompleted && (
                  <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || isSubmitting}
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 px-3"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isSubmitted && !module.isCompleted ? (
                  <span className="text-yellow-600">Response submitted and awaiting review</span>
                ) : (
                  "Tip: Use LaTeX notation for math expressions (e.g., $x^2$, $\\frac{1}{2}$, $\\sum_i^n$). Press Enter to submit, Shift+Enter for new line."
                )}
              </div>
            </div>
            
            {/* Feedback display */}
            {module.feedback && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Feedback:</h4>
                <p className="text-blue-800">{module.feedback}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 