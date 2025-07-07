"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PaceIcon } from "@/components/atoms/pace-icon"

interface PaceSelectorProps {
  value: string
  label: string
  description: string
  isSelected: boolean
  onSelect: (value: string) => void
}

export function PaceSelector({ value, label, description, isSelected, onSelect }: PaceSelectorProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onSelect(value)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <PaceIcon pace={value} />
          <div>
            <div className="font-medium">{label}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
