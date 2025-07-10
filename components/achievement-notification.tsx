/**
 * Achievement Notification Component
 * 
 * Displays toast notifications when achievements are unlocked.
 * Listens for achievement-unlocked events and shows brief celebratory messages.
 */

"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'
import { UnlockedAchievement } from '@/hooks/use-achievements'

interface AchievementNotificationProps {
  onAchievementUnlocked?: (achievement: UnlockedAchievement) => void
}

export function AchievementNotification({ onAchievementUnlocked }: AchievementNotificationProps) {
  useEffect(() => {
    console.log('🔊 AchievementNotification component mounted and listening for events')
  }, [])
  
  useEffect(() => {
    const handleAchievementUnlocked = (event: CustomEvent<UnlockedAchievement>) => {
      const achievement = event.detail
      
      console.log('🎉 Achievement event received:', achievement)
      
      // Show toast notification using Sonner
      toast.success(`🎉 Achievement Unlocked!`, {
        description: `${achievement.definition.icon} ${achievement.definition.title} - ${achievement.definition.description}`,
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
  }, [onAchievementUnlocked])

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