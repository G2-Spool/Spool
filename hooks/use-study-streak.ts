/**
 * Hook for managing study streak based on daily concept completions
 * 
 * Tracks when concepts are completed and calculates the current streak
 * based on consecutive days with at least 1 concept completed.
 */

import { useState, useEffect, useCallback } from 'react'

interface ConceptCompletion {
  conceptId: string
  completedAt: string // ISO date string
  topicId: string
  conceptTitle: string
}

interface StudyStreakData {
  completions: ConceptCompletion[]
  lastUpdated: string
}

const STORAGE_KEY = 'study-streak-data'

export function useStudyStreak() {
  const [currentStreak, setCurrentStreak] = useState<number>(0)
  const [totalCompletions, setTotalCompletions] = useState<number>(0)
  const [todayCompletions, setTodayCompletions] = useState<number>(0)

  // Load streak data from localStorage
  const loadStreakData = useCallback((): StudyStreakData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { completions: [], lastUpdated: new Date().toISOString() }
    } catch (error) {
      console.error('Failed to load streak data:', error)
      return { completions: [], lastUpdated: new Date().toISOString() }
    }
  }, [])

  // Save streak data to localStorage
  const saveStreakData = useCallback((data: StudyStreakData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save streak data:', error)
    }
  }, [])

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  // Calculate current streak based on completion data
  const calculateStreak = useCallback((completions: ConceptCompletion[]): number => {
    if (completions.length === 0) return 0

    // Group completions by date
    const completionsByDate = completions.reduce((acc, completion) => {
      const date = completion.completedAt.split('T')[0]
      if (!acc[date]) acc[date] = 0
      acc[date]++
      return acc
    }, {} as Record<string, number>)

    // Get sorted dates (most recent first)
    const sortedDates = Object.keys(completionsByDate).sort((a, b) => b.localeCompare(a))
    
    if (sortedDates.length === 0) return 0

    const today = getTodayDate()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Check if streak is still active (completed today or yesterday)
    const latestDate = sortedDates[0]
    if (latestDate !== today && latestDate !== yesterday) {
      return 0 // Streak is broken
    }

    // Count consecutive days with completions
    let streak = 0
    let currentDate = new Date(latestDate)

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = currentDate.toISOString().split('T')[0]
      
      if (completionsByDate[checkDate]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }, [])

  // Update all stats based on current data
  const updateStats = useCallback((data: StudyStreakData) => {
    const streak = calculateStreak(data.completions)
    setCurrentStreak(streak)
    setTotalCompletions(data.completions.length)
    
    // Count today's completions
    const today = getTodayDate()
    const todayCount = data.completions.filter(
      c => c.completedAt.split('T')[0] === today
    ).length
    setTodayCompletions(todayCount)
  }, [calculateStreak])

  // Record a concept completion
  const recordCompletion = useCallback((conceptId: string, topicId: string, conceptTitle: string) => {
    const data = loadStreakData()
    const completion: ConceptCompletion = {
      conceptId,
      topicId,
      conceptTitle,
      completedAt: new Date().toISOString()
    }

    // Check if this concept was already completed today (prevent duplicates)
    const today = getTodayDate()
    const alreadyCompletedToday = data.completions.some(
      c => c.conceptId === conceptId && c.completedAt.split('T')[0] === today
    )

    if (!alreadyCompletedToday) {
      data.completions.push(completion)
      data.lastUpdated = new Date().toISOString()
      saveStreakData(data)
      
      // Recalculate stats
      updateStats(data)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('study-streak-updated'))
    }
  }, [loadStreakData, saveStreakData, updateStats])

  // Load initial data
  useEffect(() => {
    const data = loadStreakData()
    updateStats(data)
  }, [loadStreakData, updateStats])

  // Listen for storage changes (when other components update the streak data)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const data = loadStreakData()
        updateStats(data)
      }
    }

    // Listen for storage events from other tabs/components
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomUpdate = () => {
      const data = loadStreakData()
      updateStats(data)
    }
    
    window.addEventListener('study-streak-updated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('study-streak-updated', handleCustomUpdate)
    }
  }, [loadStreakData, updateStats])

  // Get streak status for display
  const getStreakStatus = useCallback((): { message: string; isActive: boolean } => {
    const today = getTodayDate()
    const data = loadStreakData()
    const hasCompletedToday = data.completions.some(
      c => c.completedAt.split('T')[0] === today
    )

    if (currentStreak === 0) {
      return { message: "Start your streak!", isActive: false }
    }

    if (hasCompletedToday) {
      return { message: "Streak maintained!", isActive: true }
    }

    return { message: "Complete a concept to maintain streak", isActive: false }
  }, [currentStreak, loadStreakData])

  // Calculate weekly consistency (days meeting daily goal this week)
  const getWeeklyConsistency = useCallback((): { percentage: number; daysCompleted: number; totalDays: number } => {
    const data = loadStreakData()
    
    // Get the start and end of current week (Monday to Sunday)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday = 0
    
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() + mondayOffset)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    // Get all dates in this week
    const weekDates: string[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date.toISOString().split('T')[0])
    }
    
    // Load user's learning pace to determine daily goal
    const profile = localStorage.getItem("user-profile")
    let dailyGoal = 5 // default to steady
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        const pace = parsedProfile.learningPace || 'steady'
        dailyGoal = pace === 'turtle' ? 2 : pace === 'rabbit' ? 8 : 5
      } catch (error) {
        console.error('Failed to parse profile for daily goal:', error)
      }
    }
    
    // Count how many days this week the user met their daily goal
    let daysCompleted = 0
    weekDates.forEach(date => {
      const dayCompletions = data.completions.filter(
        c => c.completedAt.split('T')[0] === date
      ).length
      
      if (dayCompletions >= dailyGoal) {
        daysCompleted++
      }
    })
    
    const percentage = Math.round((daysCompleted / 7) * 100)
    
    return {
      percentage,
      daysCompleted,
      totalDays: 7
    }
  }, [loadStreakData])

  return {
    currentStreak,
    totalCompletions,
    todayCompletions,
    recordCompletion,
    getStreakStatus,
    getWeeklyConsistency
  }
} 