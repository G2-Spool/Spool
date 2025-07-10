/**
 * Achievement Notification Component
 * 
 * Displays toast notifications when achievements are unlocked.
 * Listens for achievement-unlocked events and shows brief celebratory messages.
 */

"use client"

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { UnlockedAchievement } from '@/hooks/use-achievements'

interface AchievementNotificationProps {
  onAchievementUnlocked?: (achievement: UnlockedAchievement) => void
}

export function AchievementNotification({ onAchievementUnlocked }: AchievementNotificationProps) {
  const { toast } = useToast()

  useEffect(() => {
    const handleAchievementUnlocked = (event: CustomEvent<UnlockedAchievement>) => {
      const achievement = event.detail
      
      // Show toast notification
      toast({
        title: `🎉 Achievement Unlocked!`,
        description: (
          <div className="flex items-center gap-2">
            <span className="text-lg">{achievement.definition.icon}</span>
            <div>
              <p className="font-semibold">{achievement.definition.title}</p>
              <p className="text-sm text-muted-foreground">{achievement.definition.description}</p>
            </div>
          </div>
        ),
        duration: 5000,
        className: getRarityClassName(achievement.definition.rarity)
      })

      // Call optional callback
      if (onAchievementUnlocked) {
        onAchievementUnlocked(achievement)
      }
    }

    // Listen for achievement unlock events
    window.addEventListener('achievement-unlocked', handleAchievementUnlocked as EventListener)

    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked as EventListener)
    }
  }, [toast, onAchievementUnlocked])

  return null // This component doesn't render anything visible
}

// Helper function to get CSS classes based on achievement rarity
function getRarityClassName(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'border-gray-300 bg-gray-50'
    case 'uncommon':
      return 'border-blue-300 bg-blue-50'
    case 'rare':
      return 'border-purple-300 bg-purple-50'
    case 'legendary':
      return 'border-yellow-300 bg-yellow-50'
    default:
      return 'border-gray-300 bg-gray-50'
  }
} 