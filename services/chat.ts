import { getCurrentUser } from 'aws-amplify/auth'

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    isAssignment?: boolean
    isGraded?: boolean
    grade?: number
    isComplete?: boolean
    assignmentId?: string
    isNewMessage?: boolean
  }
}

export interface AssessmentSession {
  sessionId: string
  conceptId: string
  status: 'active' | 'completed' | 'paused'
  messages: ChatMessage[]
  currentAssignment?: {
    id: string
    prompt: string
    isComplete: boolean
    grade?: number
  }
}

export interface InitializeAssessmentRequest {
  conceptId: string
  studentId: string
  conceptTitle?: string
}

export interface InitializeAssessmentResponse {
  sessionId: string
  initialMessage: string
  systemPrompt: string
}

export interface ChatRequest {
  sessionId: string
  message: string
  messageType?: 'response' | 'question' | 'general'
}

export interface ChatResponse {
  message: string
  messageType: 'instruction' | 'assignment' | 'feedback' | 'question' | 'completion'
  metadata?: {
    isAssignment?: boolean
    assignmentId?: string
    isGraded?: boolean
    grade?: number
    isComplete?: boolean
    nextAction?: string
  }
}

export interface CompleteAssessmentRequest {
  sessionId: string
  completionReason: 'finished' | 'timeout' | 'manual'
}

export interface CompleteAssessmentResponse {
  summary: string
  finalGrade?: number
  completedAssignments: number
  totalAssignments: number
  recommendedNextSteps: string[]
}

class ChatService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || ''

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const user = await getCurrentUser()
      const token = user.signInDetails?.loginId || ''
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async initializeAssessment(
    request: InitializeAssessmentRequest
  ): Promise<InitializeAssessmentResponse> {
    return this.makeRequest<InitializeAssessmentResponse>(
      '/content/assessment/initialize',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>(
      '/content/assessment/chat',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  async completeAssessment(
    request: CompleteAssessmentRequest
  ): Promise<CompleteAssessmentResponse> {
    return this.makeRequest<CompleteAssessmentResponse>(
      '/content/assessment/complete',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  async generateExercise(conceptId: string): Promise<any> {
    return this.makeRequest<any>(
      '/content/generate-exercise',
      {
        method: 'POST',
        body: JSON.stringify({ conceptId }),
      }
    )
  }

  async assessAnswer(sessionId: string, assignmentId: string, answer: string): Promise<any> {
    return this.makeRequest<any>(
      '/content/assess-answer',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, assignmentId, answer }),
      }
    )
  }

  async getUserStats(studentId: string): Promise<any> {
    return this.makeRequest<any>(`/content/stats?studentId=${studentId}`)
  }

  async getLearningPath(studentId: string): Promise<any> {
    return this.makeRequest<any>(`/content/learning-path?studentId=${studentId}`)
  }

  async getRecommendations(studentId: string, conceptId: string): Promise<any> {
    return this.makeRequest<any>(
      `/content/recommendations?studentId=${studentId}&conceptId=${conceptId}`
    )
  }
}

export const chatService = new ChatService() 