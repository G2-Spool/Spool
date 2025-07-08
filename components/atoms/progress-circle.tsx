"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgressCircleProps {
  progress: number // 0-100
  size?: number
  onClick?: () => void
}

export function ProgressCircle({ progress, size = 48, onClick }: ProgressCircleProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const buttonSize = size - strokeWidth * 2

  return (
    <div className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200" style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90 pointer-events-none" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#6b7280" strokeWidth={strokeWidth} fill="none" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#78af9f"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <Button
        className="rounded-full bg-gray-600 group-hover:bg-gray-600 group-hover:shadow-xl border-0 shadow-sm flex items-center justify-center p-0 transition-all duration-200"
        style={{ width: buttonSize, height: buttonSize }}
        onClick={(e) => {
          e?.stopPropagation()
          onClick?.()
        }}
      >
        <Play className="h-5 w-5 fill-current text-white group-hover:text-primary group-hover:scale-110 ml-0.5 transition-all duration-200" />
      </Button>
    </div>
  )
} 