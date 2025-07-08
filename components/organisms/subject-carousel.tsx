"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TopicCard } from "@/components/molecules/topic-card"

interface Topic {
  id: string
  title: string
  description?: string
  chapters: number
  items: number
  progress: number
}

interface SubjectCarouselProps {
  title: string
  topics: Topic[]
  color: string
  onTopicClick?: (topicId: string) => void
  onPlayClick?: (topicId: string) => void
}

export function SubjectCarousel({ title, topics, color, onTopicClick, onPlayClick }: SubjectCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const cardWidth = 336 // 320px + 16px gap (20% larger than 256px)
  const maxScroll = Math.max(0, topics.length * cardWidth - 4 * cardWidth)

  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - cardWidth * 2)
    setScrollPosition(newPosition)
  }

  const scrollRight = () => {
    const newPosition = Math.min(maxScroll, scrollPosition + cardWidth * 2)
    setScrollPosition(newPosition)
  }

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < maxScroll

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0 bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex space-x-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              title={topic.title}
              description={topic.description}
              chapters={topic.chapters}
              items={topic.items}
              progress={topic.progress}
              color={color}
              onCardClick={() => onTopicClick?.(topic.id)}
              onPlayClick={() => onPlayClick?.(topic.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 