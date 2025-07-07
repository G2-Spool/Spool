"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface InterestBadgeProps {
  interest: string
  onRemove?: (interest: string) => void
  variant?: "default" | "secondary" | "outline"
}

export function InterestBadge({ interest, onRemove, variant = "secondary" }: InterestBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      className="flex items-center space-x-1 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border-transparent rounded-md text-sm"
    >
      <span>{interest}</span>
      {onRemove && (
        <button 
          onClick={() => onRemove(interest)} 
          className="ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
