"use client"

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  isSelected?: boolean
}

export function ProgressRing({ progress, size = 48, isSelected = false }: ProgressRingProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke={isSelected ? "#78af9f" : "#e5e7eb"} 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        {/* Progress circle */}
        {!isSelected && progress > 0 && (
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
        )}
      </svg>
    </div>
  )
} 