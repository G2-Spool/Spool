"use client"

import { Turtle, Gauge, Zap, type LucideIcon } from "lucide-react"

interface PaceIconProps {
  pace: string
  className?: string
}

export function PaceIcon({ pace, className = "h-6 w-6" }: PaceIconProps) {
  const getIcon = (): LucideIcon => {
    switch (pace) {
      case "turtle":
        return Turtle
      case "steady":
        return Gauge
      case "rabbit":
        return Zap
      default:
        return Gauge
    }
  }

  const Icon = getIcon()
  return <Icon className={`${className} text-primary`} />
}
