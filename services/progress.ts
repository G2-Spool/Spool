import { API_ENDPOINTS, apiCall, getAuthHeaders } from '@/lib/api-config'
import { fetchAuthSession } from 'aws-amplify/auth'
import { 
  UserProgress, 
  LearningStats, 
  Achievement, 
  WeeklyProgress, 
  LearningStreak, 
  ProgressUpdateRequest,
  ApiResponse,
  PaginatedResponse 
} from '@/types/backend'

// Helper function to get authenticated headers
async function getAuthenticatedHeaders(): Promise<HeadersInit> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    return getAuthHeaders(token)
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return getAuthHeaders()
  }
}

// ===== PROGRESS TRACKING =====
export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<PaginatedResponse<UserProgress>>(
    `${API_ENDPOINTS.PROGRESS.GET_PROGRESS}?user_id=${userId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch user progress:', response.error)
  return []
}

export async function getTopicProgress(userId: string, topicId: string): Promise<UserProgress[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<PaginatedResponse<UserProgress>>(
    `${API_ENDPOINTS.PROGRESS.GET_PROGRESS}?user_id=${userId}&topic_id=${topicId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error(`Failed to fetch topic progress for ${topicId}:`, response.error)
  return []
}

export async function getConceptProgress(userId: string, conceptId: string): Promise<UserProgress | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<UserProgress>>(
    `${API_ENDPOINTS.PROGRESS.GET_PROGRESS}?user_id=${userId}&concept_id=${conceptId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error(`Failed to fetch concept progress for ${conceptId}:`, response.error)
  return null
}

export async function updateProgress(progressUpdate: ProgressUpdateRequest): Promise<boolean> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<UserProgress>>(
    API_ENDPOINTS.PROGRESS.UPDATE_PROGRESS,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(progressUpdate),
    }
  )

  if (response.success) {
    console.log('Progress updated successfully')
    return true
  }

  console.error('Failed to update progress:', response.error)
  return false
}

// ===== LEARNING STATISTICS =====
export async function getLearningStats(userId: string): Promise<LearningStats | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<LearningStats>>(
    `${API_ENDPOINTS.PROGRESS.GET_STATS}?user_id=${userId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch learning stats:', response.error)
  return null
}

export async function getWeeklyProgress(userId: string, weeks: number = 12): Promise<WeeklyProgress[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<WeeklyProgress[]>>(
    `${API_ENDPOINTS.PROGRESS.GET_STATS}?user_id=${userId}&type=weekly&weeks=${weeks}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch weekly progress:', response.error)
  return []
}

// ===== ACHIEVEMENTS =====
export async function getAchievements(userId: string): Promise<Achievement[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<PaginatedResponse<Achievement>>(
    `${API_ENDPOINTS.PROGRESS.GET_ACHIEVEMENTS}?user_id=${userId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch achievements:', response.error)
  return []
}

export async function getRecentAchievements(userId: string, limit: number = 5): Promise<Achievement[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<PaginatedResponse<Achievement>>(
    `${API_ENDPOINTS.PROGRESS.GET_ACHIEVEMENTS}?user_id=${userId}&limit=${limit}&sort=recent`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch recent achievements:', response.error)
  return []
}

// ===== LEARNING STREAK =====
export async function getLearningStreak(userId: string): Promise<LearningStreak | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<LearningStreak>>(
    `${API_ENDPOINTS.PROGRESS.GET_LEARNING_STREAK}?user_id=${userId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch learning streak:', response.error)
  return null
}

// ===== UTILITY FUNCTIONS =====
export function calculateOverallProgress(userProgress: UserProgress[]): number {
  if (userProgress.length === 0) return 0
  
  const totalProgress = userProgress.reduce((sum, progress) => sum + progress.progress_percentage, 0)
  return Math.round(totalProgress / userProgress.length)
}

export function getMasteryLevel(progress: UserProgress[]): 'not_started' | 'learning' | 'practiced' | 'mastered' {
  if (progress.length === 0) return 'not_started'
  
  const completedCount = progress.filter(p => p.progress_percentage >= 100).length
  const totalCount = progress.length
  
  if (completedCount === 0) return 'not_started'
  if (completedCount === totalCount) return 'mastered'
  if (completedCount > totalCount / 2) return 'practiced'
  return 'learning'
}

export function getTimeSpentToday(userProgress: UserProgress[]): number {
  const today = new Date().toDateString()
  return userProgress
    .filter(p => new Date(p.last_accessed).toDateString() === today)
    .reduce((sum, p) => sum + p.time_spent_minutes, 0)
}

export function getCompletedConceptsCount(userProgress: UserProgress[]): number {
  return userProgress.filter(p => p.progress_percentage >= 100).length
}

export function getInProgressConceptsCount(userProgress: UserProgress[]): number {
  return userProgress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length
}

// ===== PROGRESS TRACKING HELPERS =====
export async function markConceptStarted(userId: string, conceptId: string): Promise<boolean> {
  return await updateProgress({
    user_id: userId,
    concept_id: conceptId,
    time_spent_minutes: 0,
    completion_percentage: 1,
    mastery_level: 'learning'
  })
}

export async function markConceptCompleted(userId: string, conceptId: string, timeSpent: number): Promise<boolean> {
  return await updateProgress({
    user_id: userId,
    concept_id: conceptId,
    time_spent_minutes: timeSpent,
    completion_percentage: 100,
    mastery_level: 'mastered'
  })
}

export async function trackTimeSpent(userId: string, conceptId: string, timeSpent: number): Promise<boolean> {
  return await updateProgress({
    user_id: userId,
    concept_id: conceptId,
    time_spent_minutes: timeSpent,
    mastery_level: 'learning'
  })
}

export async function updateMasteryLevel(
  userId: string, 
  conceptId: string, 
  masteryLevel: 'not_started' | 'learning' | 'practiced' | 'mastered'
): Promise<boolean> {
  return await updateProgress({
    user_id: userId,
    concept_id: conceptId,
    time_spent_minutes: 0,
    mastery_level: masteryLevel
  })
} 