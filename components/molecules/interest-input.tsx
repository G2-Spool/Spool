"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface InterestInputProps {
  onAdd: (interest: string) => void
  placeholder?: string
}

const formatInterestText = (text: string): string => {
  const trimmed = text.trim()
  if (!trimmed) return ""
  
  // Replace multiple spaces with single spaces and capitalize every word
  return trimmed
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function InterestInput({ onAdd, placeholder = "Add a new interest" }: InterestInputProps) {
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const formatted = formatInterestText(value)
    if (formatted) {
      onAdd(formatted)
      setValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <div>
      <Label htmlFor="interest">Add your interests and hobbies</Label>
      <div className="flex space-x-2 mt-2">
        <Input
          id="interest"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
