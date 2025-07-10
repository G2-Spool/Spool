import { API_ENDPOINTS, apiCall, getAuthHeaders } from '@/lib/api-config'
import { fetchAuthSession } from 'aws-amplify/auth'
import { 
  Exercise, 
  ExerciseSubmission, 
  ExerciseRequest, 
  ExerciseOption,
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

// ===== EXERCISE GENERATION =====
export async function generateExercise(request: ExerciseRequest): Promise<Exercise | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<Exercise>>(
    API_ENDPOINTS.EXERCISE.GENERATE,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to generate exercise:', response.error)
  return null
}

export async function generatePersonalizedExercise(
  conceptId: string,
  userId: string,
  userInterests: string[] = [],
  learningGoals: string[] = [],
  previousPerformance: number = 0,
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
  exerciseType?: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'code'
): Promise<Exercise | null> {
  const request: ExerciseRequest = {
    concept_id: conceptId,
    difficulty_level: difficulty,
    exercise_type: exerciseType,
    user_context: {
      interests: userInterests,
      learning_goals: learningGoals,
      previous_performance: previousPerformance
    }
  }

  return await generateExercise(request)
}

export async function generateMultipleExercises(
  conceptId: string,
  count: number = 5,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): Promise<Exercise[]> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<Exercise[]>>(
    API_ENDPOINTS.EXERCISE.GENERATE,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        concept_id: conceptId,
        count,
        difficulty_level: difficulty
      }),
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to generate multiple exercises:', response.error)
  return []
}

// ===== EXERCISE RETRIEVAL =====
export async function getExercises(conceptId?: string): Promise<Exercise[]> {
  const headers = await getAuthenticatedHeaders()
  const url = conceptId 
    ? `${API_ENDPOINTS.EXERCISE.GET_EXERCISES}?concept_id=${conceptId}`
    : API_ENDPOINTS.EXERCISE.GET_EXERCISES
  
  const response = await apiCall<PaginatedResponse<Exercise>>(url, {
    method: 'GET',
    headers,
  })

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch exercises:', response.error)
  return []
}

export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<Exercise>>(
    `${API_ENDPOINTS.EXERCISE.GET_EXERCISES}/${exerciseId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error(`Failed to fetch exercise ${exerciseId}:`, response.error)
  return null
}

// ===== EXERCISE SUBMISSION =====
export async function submitExerciseAnswer(
  exerciseId: string,
  userId: string,
  answer: string
): Promise<ExerciseSubmission | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<ExerciseSubmission>>(
    API_ENDPOINTS.EXERCISE.SUBMIT_ANSWER,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        exercise_id: exerciseId,
        user_id: userId,
        answer
      }),
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to submit exercise answer:', response.error)
  return null
}

export async function assessAnswer(
  exerciseId: string,
  answer: string,
  userId?: string
): Promise<{
  is_correct: boolean
  score: number
  feedback: string
  explanation?: string
} | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<{
    is_correct: boolean
    score: number
    feedback: string
    explanation?: string
  }>>(
    API_ENDPOINTS.EXERCISE.ASSESS_ANSWER,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        exercise_id: exerciseId,
        answer,
        user_id: userId
      }),
    }
  )

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to assess answer:', response.error)
  return null
}

// ===== EXERCISE FEEDBACK =====
export async function getExerciseFeedback(
  exerciseId: string,
  userId: string
): Promise<string | null> {
  const headers = await getAuthenticatedHeaders()
  
  const response = await apiCall<ApiResponse<{feedback: string}>>(
    `${API_ENDPOINTS.EXERCISE.GET_FEEDBACK}?exercise_id=${exerciseId}&user_id=${userId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (response.success && response.data?.data?.feedback) {
    return response.data.data.feedback
  }

  console.error('Failed to get exercise feedback:', response.error)
  return null
}

// ===== EXERCISE UTILITIES =====
export function isMultipleChoiceExercise(exercise: Exercise): boolean {
  return exercise.type === 'multiple_choice' && !!exercise.options && exercise.options.length > 0
}

export function getCorrectAnswer(exercise: Exercise): string | null {
  if (exercise.type === 'multiple_choice' && exercise.options) {
    const correctOption = exercise.options.find(option => option.is_correct === true)
    return correctOption ? correctOption.text : null
  }
  return exercise.correct_answer || null
}

export function shuffleOptions(options: ExerciseOption[]): ExerciseOption[] {
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function formatExerciseForDisplay(exercise: Exercise): Exercise {
  if (exercise.type === 'multiple_choice' && exercise.options) {
    return {
      ...exercise,
      options: shuffleOptions(exercise.options)
    }
  }
  return exercise
}

export function calculateScore(
  isCorrect: boolean,
  timeSpent: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): number {
  if (!isCorrect) return 0
  
  const baseScore = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20
  const timeBonus = Math.max(0, 5 - Math.floor(timeSpent / 30)) // Bonus for quick answers
  
  return baseScore + timeBonus
}

export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600'
    case 'intermediate':
      return 'text-yellow-600'
    case 'advanced':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getExerciseTypeIcon(type: string): string {
  switch (type) {
    case 'multiple_choice':
      return '📝'
    case 'short_answer':
      return '✍️'
    case 'essay':
      return '📄'
    case 'problem_solving':
      return '🧮'
    case 'code':
      return '💻'
    default:
      return '❓'
  }
}

// ===== EXERCISE ANALYTICS =====
export async function getExerciseAnalytics(
  userId: string,
  conceptId?: string
): Promise<{
  total_attempts: number
  correct_answers: number
  average_score: number
  favorite_exercise_type: string
  improvement_areas: string[]
} | null> {
  const headers = await getAuthenticatedHeaders()
  const url = conceptId 
    ? `${API_ENDPOINTS.EXERCISE.GET_EXERCISES}/analytics?user_id=${userId}&concept_id=${conceptId}`
    : `${API_ENDPOINTS.EXERCISE.GET_EXERCISES}/analytics?user_id=${userId}`
  
  const response = await apiCall<ApiResponse<{
    total_attempts: number
    correct_answers: number
    average_score: number
    favorite_exercise_type: string
    improvement_areas: string[]
  }>>(url, {
    method: 'GET',
    headers,
  })

  if (response.success && response.data?.data) {
    return response.data.data
  }

  console.error('Failed to fetch exercise analytics:', response.error)
  return null
} 