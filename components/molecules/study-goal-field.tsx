"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface StudyGoalFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function StudyGoalField({ label, value, onChange, placeholder }: StudyGoalFieldProps) {
  return (
    <div>
      <Label htmlFor={label.toLowerCase()}>{label}</Label>
      <Input
        id={label.toLowerCase()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
