"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressRowProps {
  label: string
  value: number
  showPercentage?: boolean
}

export function ProgressRow({ label, value, showPercentage = true }: ProgressRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center space-x-2">
        <Progress value={value} className="w-20" />
        {showPercentage && <span className="text-sm text-white">{value}%</span>}
      </div>
    </div>
  )
}
