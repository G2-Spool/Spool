/**
 * Achievement system for tracking and displaying learning milestones
 * 
 * Manages achievement definitions, checking conditions, and storing unlocked achievements.
 * Designed to work with localStorage initially but can be migrated to user accounts.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

// Interface for completion data (matching the study streak interface)
interface ConceptCompletion {
  conceptId: string
  completedAt: string
  completedTime?: string
  topicId: string
  conceptTitle: string
}

// Achievement rarity levels for visual styling
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

// Achievement category for organization
export type AchievementCategory = 'streak' | 'learning' | 'consistency' | 'mastery'

// Achievement definition interface
export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: AchievementCategory
  condition: string // Human-readable condition description
}

// Unlocked achievement with timestamp
export interface UnlockedAchievement {
  id: string
  unlockedAt: string // ISO timestamp
  definition: AchievementDefinition
}

// Achievement storage interface
interface AchievementData {
  unlockedAchievements: UnlockedAchievement[]
  lastChecked: string
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 🔥 Streak Achievements
  {
    id: 'first-study-day',
    title: 'Learning Journey Begins',
    description: 'Completed your first concept',
    icon: '🌱',
    rarity: 'common',
    category: 'streak',
    condition: 'Complete 1 concept'
  },
  {
    id: 'streak-3',
    title: 'Getting Started',
    description: 'Studied for 3 days in a row',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    condition: '3-day study streak'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    icon: '⚡',
    rarity: 'uncommon',
    category: 'streak',
    condition: '7-day study streak'
  },
  {
    id: 'streak-14',
    title: 'Streak Master',
    description: 'Achieved a 14-day study streak',
    icon: '🏆',
    rarity: 'rare',
    category: 'streak',
    condition: '14-day study streak'
  },
  {
    id: 'streak-30',
    title: 'Dedication Legend',
    description: 'Incredible 30-day study streak',
    icon: '👑',
    rarity: 'legendary',
    category: 'streak',
    condition: '30-day study streak'
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Returned to studying after a break',
    icon: '💪',
    rarity: 'common',
    category: 'streak',
    condition: 'Study after 3+ day gap'
  },

  // 📚 Learning Milestones
  {
    id: 'concept-collector-5',
    title: 'Concept Collector',
    description: 'Completed 5 concepts',
    icon: '📝',
    rarity: 'common',
    category: 'learning',
    condition: 'Complete 5 concepts total'
  },
  {
    id: 'concept-collector-25',
    title: 'Knowledge Builder',
    description: 'Completed 25 concepts',
    icon: '🧠',
    rarity: 'uncommon',
    category: 'learning',
    condition: 'Complete 25 concepts total'
  },
  {
    id: 'section-champion',
    title: 'Section Champion',
    description: 'Completed an entire section',
    icon: '🎯',
    rarity: 'uncommon',
    category: 'learning',
    condition: 'Complete all concepts in a section'
  },
  {
    id: 'topic-explorer',
    title: 'Topic Explorer',
    description: 'Started studying 3 different topics',
    icon: '🗺️',
    rarity: 'uncommon',
    category: 'learning',
    condition: 'Progress in 3 different topics'
  },
  {
    id: 'subject-master',
    title: 'Subject Master',
    description: 'Completed an entire topic',
    icon: '🏅',
    rarity: 'rare',
    category: 'learning',
    condition: '100% completion in any topic'
  },

  // ⚡ Consistency Achievements
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Studied on both Saturday and Sunday',
    icon: '🌅',
    rarity: 'common',
    category: 'consistency',
    condition: 'Study on weekend days'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Studied before 9 AM',
    icon: '🌅',
    rarity: 'common',
    category: 'consistency',
    condition: 'Complete concept before 9 AM'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Studied after 9 PM',
    icon: '🌙',
    rarity: 'common',
    category: 'consistency',
    condition: 'Complete concept after 9 PM'
  },
  {
    id: 'productive-week',
    title: 'Productive Week',
    description: 'Studied 5 days this week',
    icon: '📅',
    rarity: 'uncommon',
    category: 'consistency',
    condition: 'Study 5 different days in one week'
  },

  // 🎯 Mastery Achievements
  {
    id: 'speed-learner',
    title: 'Speed Learner',
    description: 'Completed 5 concepts in one day',
    icon: '⚡',
    rarity: 'uncommon',
    category: 'mastery',
    condition: 'Complete 5 concepts in one day'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Completed a section without mistakes',
    icon: '✨',
    rarity: 'rare',
    category: 'mastery',
    condition: 'Complete section without mistakes'
  }
]

const getAchievementStorageKey = (userId?: string) => userId ? `achievement-data-${userId}` : 'achievement-data'
const getStudyStreakStorageKey = (userId?: string) => userId ? `study-streak-data-${userId}` : 'study-streak-data'

export function useAchievements() {
  const { user } = useAuth()
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([])
  const [newAchievements, setNewAchievements] = useState<UnlockedAchievement[]>([])

  // Load achievement data from localStorage
  const loadAchievementData = useCallback((): AchievementData => {
    try {
      const stored = localStorage.getItem(getAchievementStorageKey(user?.sub))
      return stored ? JSON.parse(stored) : { unlockedAchievements: [], lastChecked: new Date().toISOString() }
    } catch (error) {
      console.error('Failed to load achievement data:', error)
      return { unlockedAchievements: [], lastChecked: new Date().toISOString() }
    }
  }, [user?.sub])

  // Save achievement data to localStorage
  const saveAchievementData = useCallback((data: AchievementData) => {
    try {
      localStorage.setItem(getAchievementStorageKey(user?.sub), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save achievement data:', error)
    }
  }, [user?.sub])

  // Get achievement definition by ID
  const getAchievementDefinition = useCallback((id: string): AchievementDefinition | undefined => {
    return ACHIEVEMENT_DEFINITIONS.find(def => def.id === id)
  }, [])

  // Check if achievement is already unlocked
  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return unlockedAchievements.some(achievement => achievement.id === achievementId)
  }, [unlockedAchievements])

  // Unlock a new achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    const definition = getAchievementDefinition(achievementId)
    if (!definition) {
      console.error(`Achievement definition not found: ${achievementId}`)
      return
    }

    if (isAchievementUnlocked(achievementId)) {
      return // Already unlocked
    }

    const newAchievement: UnlockedAchievement = {
      id: achievementId,
      unlockedAt: new Date().toISOString(),
      definition
    }

    const data = loadAchievementData()
    data.unlockedAchievements.push(newAchievement)
    saveAchievementData(data)

    setUnlockedAchievements(prev => [...prev, newAchievement])
    setNewAchievements(prev => [...prev, newAchievement])

    // Dispatch event for notifications
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: newAchievement }))
  }, [getAchievementDefinition, isAchievementUnlocked, loadAchievementData, saveAchievementData])

  // Get recent achievements for display (max 10, last 30 days)
  const getRecentAchievements = useCallback((): UnlockedAchievement[] => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAchievements = unlockedAchievements.filter(achievement => 
      new Date(achievement.unlockedAt) >= thirtyDaysAgo
    )

    return recentAchievements
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 10)
  }, [unlockedAchievements])

  // Clear new achievements (for after showing notifications)
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([])
  }, [])

  // Helper function to get local date string
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Check achievements against current study data
  const checkAchievements = useCallback(() => {
    // Get study streak data
    const studyStreakData = localStorage.getItem(getStudyStreakStorageKey(user?.sub))
    if (!studyStreakData) return

    try {
      const { completions }: { completions: ConceptCompletion[] } = JSON.parse(studyStreakData)
      const newUnlocks: string[] = []

      // Get current streak from localStorage (calculated by useStudyStreak)
      const currentStreak = getCurrentStreak(completions)

      // 🔥 Streak Achievements
      if (completions.length >= 1 && !isAchievementUnlocked('first-study-day')) {
        newUnlocks.push('first-study-day')
      }
      if (currentStreak >= 3 && !isAchievementUnlocked('streak-3')) {
        newUnlocks.push('streak-3')
      }
      if (currentStreak >= 7 && !isAchievementUnlocked('streak-7')) {
        newUnlocks.push('streak-7')
      }
      if (currentStreak >= 14 && !isAchievementUnlocked('streak-14')) {
        newUnlocks.push('streak-14')
      }
      if (currentStreak >= 30 && !isAchievementUnlocked('streak-30')) {
        newUnlocks.push('streak-30')
      }

      // Comeback Kid - check if there was a gap of 3+ days before latest completion
      if (completions.length >= 2 && !isAchievementUnlocked('comeback-kid')) {
        const sortedCompletions = [...completions].sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
        const latest = new Date(sortedCompletions[0].completedAt)
        const previous = new Date(sortedCompletions[1].completedAt)
        const daysDiff = Math.floor((latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff >= 3) {
          newUnlocks.push('comeback-kid')
        }
      }

      // 📚 Learning Milestones
      if (completions.length >= 5 && !isAchievementUnlocked('concept-collector-5')) {
        newUnlocks.push('concept-collector-5')
      }
      if (completions.length >= 25 && !isAchievementUnlocked('concept-collector-25')) {
        newUnlocks.push('concept-collector-25')
      }

      // Topic Explorer - check for 3 different topics
      if (!isAchievementUnlocked('topic-explorer')) {
        const uniqueTopics = new Set(completions.map((c: ConceptCompletion) => c.topicId))
        if (uniqueTopics.size >= 3) {
          newUnlocks.push('topic-explorer')
        }
      }

      // Section Champion & Subject Master - check topic progress
      if (!isAchievementUnlocked('section-champion') || !isAchievementUnlocked('subject-master')) {
        const availableTopics = ["college-algebra", "statistics", "biology", "anatomy"]
        
        for (const topicId of availableTopics) {
          try {
            // Import the getTopicData function dynamically
            const topicData = getTopicDataForAchievements(topicId)
            
            for (const section of topicData.sections) {
              if (section.concepts && section.concepts.length > 0) {
                const sectionCompletions = section.concepts.filter(c => c.completed).length
                
                // Section Champion
                if (sectionCompletions === section.concepts.length && !isAchievementUnlocked('section-champion')) {
                  newUnlocks.push('section-champion')
                }
              }
            }
            
            // Subject Master - check if entire topic is completed
            if (!isAchievementUnlocked('subject-master')) {
              const totalConcepts = topicData.sections.reduce((total, section) => 
                total + (section.concepts?.length || 0), 0
              )
              const completedConcepts = topicData.sections.reduce((total, section) => 
                total + (section.concepts?.filter(c => c.completed).length || 0), 0
              )
              
              if (totalConcepts > 0 && completedConcepts === totalConcepts) {
                newUnlocks.push('subject-master')
              }
            }
          } catch (error) {
            console.error(`Failed to check topic ${topicId} for achievements:`, error)
          }
        }
      }

      // ⚡ Consistency Achievements
      // Weekend Warrior - check for both Saturday and Sunday completions
      if (!isAchievementUnlocked('weekend-warrior')) {
        const weekendCompletions = completions.filter((completion: ConceptCompletion) => {
          const date = new Date(completion.completedAt)
          const day = date.getDay()
          return day === 0 || day === 6 // Sunday or Saturday
        })
        
        const weekendDates = new Set(weekendCompletions.map((c: ConceptCompletion) => 
          getLocalDateString(new Date(c.completedAt))
        ))
        
        // Check if we have both Saturday and Sunday in the same weekend
        for (const completion of weekendCompletions) {
          const date = new Date(completion.completedAt)
          const day = date.getDay()
          
          if (day === 0) { // Sunday
            // Check if we have Saturday from the same weekend
            const saturday = new Date(date)
            saturday.setDate(date.getDate() - 1)
            const saturdayDate = getLocalDateString(saturday)
            if (weekendDates.has(saturdayDate)) {
              newUnlocks.push('weekend-warrior')
              break
            }
          } else if (day === 6) { // Saturday
            // Check if we have Sunday from the same weekend
            const sunday = new Date(date)
            sunday.setDate(date.getDate() + 1)
            const sundayDate = getLocalDateString(sunday)
            if (weekendDates.has(sundayDate)) {
              newUnlocks.push('weekend-warrior')
              break
            }
          }
        }
      }

      // Time-based achievements (Early Bird, Night Owl)
      if (!isAchievementUnlocked('early-bird')) {
        const earlyCompletions = completions.filter((completion: ConceptCompletion) => {
          if (completion.completedTime) {
            const hour = parseInt(completion.completedTime.split(':')[0])
            return hour < 9
          }
          return false
        })
        if (earlyCompletions.length >= 1) {
          newUnlocks.push('early-bird')
        }
      }

      if (!isAchievementUnlocked('night-owl')) {
        const nightCompletions = completions.filter((completion: ConceptCompletion) => {
          if (completion.completedTime) {
            const hour = parseInt(completion.completedTime.split(':')[0])
            return hour >= 21
          }
          return false
        })
        if (nightCompletions.length >= 1) {
          newUnlocks.push('night-owl')
        }
      }

      // Productive Week - check for 5 different days in current week
      if (!isAchievementUnlocked('productive-week')) {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() + mondayOffset)
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        
        const weekCompletions = completions.filter((completion: ConceptCompletion) => {
          const date = new Date(completion.completedAt)
          return date >= startOfWeek && date <= endOfWeek
        })
        
        const uniqueDays = new Set(weekCompletions.map((c: ConceptCompletion) => 
          getLocalDateString(new Date(c.completedAt))
        ))
        
        if (uniqueDays.size >= 5) {
          newUnlocks.push('productive-week')
        }
      }

      // 🎯 Mastery Achievements
      // Speed Learner - 5 concepts in one day
      if (!isAchievementUnlocked('speed-learner')) {
        const completionsByDate = completions.reduce((acc: Record<string, number>, completion: ConceptCompletion) => {
          const date = getLocalDateString(new Date(completion.completedAt))
          if (!acc[date]) acc[date] = 0
          acc[date]++
          return acc
        }, {} as Record<string, number>)
        
        const dailyCounts = Object.values(completionsByDate)
        const maxDaily = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0
        if (maxDaily >= 5) {
          newUnlocks.push('speed-learner')
        }
      }

      // Unlock new achievements
      newUnlocks.forEach(achievementId => {
        unlockAchievement(achievementId)
      })

    } catch (error) {
      console.error('Failed to check achievements:', error)
    }
  }, [isAchievementUnlocked, unlockAchievement, user?.sub])

  // Helper function to calculate current streak (duplicated from useStudyStreak for independence)
  const getCurrentStreak = (completions: ConceptCompletion[]): number => {
    if (completions.length === 0) return 0

    const getLocalDateFromISO = (isoString: string): string => {
      return getLocalDateString(new Date(isoString))
    }

    const getTodayDate = (): string => {
      return getLocalDateString(new Date())
    }

    const completionsByDate = completions.reduce((acc, completion) => {
      const date = getLocalDateFromISO(completion.completedAt)
      if (!acc[date]) acc[date] = 0
      acc[date]++
      return acc
    }, {} as Record<string, number>)

    const sortedDates = Object.keys(completionsByDate).sort((a, b) => b.localeCompare(a))
    if (sortedDates.length === 0) return 0

    const today = getTodayDate()
    const yesterday = (() => {
      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      return getLocalDateString(yesterdayDate)
    })()

    const latestDate = sortedDates[0]
    if (latestDate !== today && latestDate !== yesterday) {
      return 0
    }

    let streak = 0
    const [year, month, day] = latestDate.split('-').map(Number)
    let currentDate = new Date(year, month - 1, day)

    while (true) {
      const checkDate = getLocalDateString(currentDate)
      if (completionsByDate[checkDate]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // Helper function to get topic data for achievements (simplified version)
  const getTopicDataForAchievements = (topicId: string) => {
    // This would need to be implemented based on your topic data structure
    // For now, return a simplified structure that matches the expected interface
    return {
      title: topicId,
      sections: [] as Array<{
        title: string
        concepts?: Array<{
          id: string
          title: string
          completed: boolean
        }>
      }>
    }
  }

  // Load initial data
  useEffect(() => {
    const data = loadAchievementData()
    setUnlockedAchievements(data.unlockedAchievements)
  }, [loadAchievementData])

  return {
    unlockedAchievements,
    newAchievements,
    getAchievementDefinition,
    isAchievementUnlocked,
    unlockAchievement,
    getRecentAchievements,
    clearNewAchievements,
    checkAchievements,
    achievementDefinitions: ACHIEVEMENT_DEFINITIONS
  }
}

// Export achievement definitions for use in other components
export { ACHIEVEMENT_DEFINITIONS } 