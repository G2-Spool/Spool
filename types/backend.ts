// Backend Data Types for Spool Microservices

// ===== USER TYPES =====
export interface UserProfile {
  id: string
  email: string
  given_name?: string
  family_name?: string
  interests?: string[]
  learning_goals?: string[]
  pace_preference?: 'slow' | 'medium' | 'fast'
  preferred_difficulty?: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
  updated_at: string
}

// ===== CONTENT TYPES =====
export interface Topic {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number
  prerequisites?: string[]
  learning_objectives: string[]
  sections: Section[]
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  title: string
  description: string
  order: number
  concepts: Concept[]
  estimated_duration_minutes: number
}

export interface Concept {
  id: string
  title: string
  description: string
  section_id: string
  order: number
  learning_modules: LearningModule[]
  exercises: Exercise[]
  estimated_duration_minutes: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
}

export interface LearningModule {
  id: string
  type: 'text' | 'video' | 'diagram' | 'interactive' | 'quote' | 'assignment' | 'youtube'
  title: string
  content: ModuleContent
  order: number
  estimated_duration_minutes: number
}

export interface ModuleContent {
  // Text Module
  text?: string
  
  // Video Module
  video_url?: string
  video_duration?: number
  
  // YouTube Module
  youtube_id?: string
  
  // Diagram Module
  diagram_type?: 'flowchart' | 'mind_map' | 'concept_map' | 'graph'
  diagram_data?: any
  
  // Interactive Module
  interactive_type?: 'simulation' | 'quiz' | 'coding_exercise'
  interactive_data?: any
  
  // Quote Module
  quote_text?: string
  quote_author?: string
  
  // Assignment Module
  assignment_prompt?: string
  assignment_type?: 'essay' | 'problem_solving' | 'project'
  expected_length?: number
}

// ===== EXERCISE TYPES =====
export interface Exercise {
  id: string
  concept_id: string
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'code'
  title: string
  prompt: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_minutes: number
  options?: ExerciseOption[]
  correct_answer?: string
  explanation?: string
  hints?: string[]
  created_at: string
}

export interface ExerciseOption {
  id: string
  text: string
  is_correct: boolean
  explanation?: string
}

export interface ExerciseSubmission {
  id: string
  exercise_id: string
  user_id: string
  answer: string
  is_correct: boolean
  score: number
  feedback: string
  submitted_at: string
}

export interface ExerciseRequest {
  concept_id: string
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  exercise_type?: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'code'
  user_context?: {
    interests: string[]
    learning_goals: string[]
    previous_performance: number
  }
}

// ===== PROGRESS TYPES =====
export interface UserProgress {
  id: string
  user_id: string
  topic_id: string
  section_id?: string
  concept_id?: string
  progress_percentage: number
  completed_at?: string
  time_spent_minutes: number
  last_accessed: string
  mastery_level: 'not_started' | 'learning' | 'practiced' | 'mastered'
}

export interface LearningStats {
  user_id: string
  total_topics_started: number
  total_topics_completed: number
  total_concepts_completed: number
  total_exercises_completed: number
  total_time_spent_minutes: number
  average_score: number
  current_streak_days: number
  longest_streak_days: number
  achievements: Achievement[]
  weekly_progress: WeeklyProgress[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'consistency' | 'performance' | 'exploration'
  earned_at: string
  progress_value: number
  target_value: number
}

export interface WeeklyProgress {
  week_start: string
  topics_completed: number
  concepts_completed: number
  exercises_completed: number
  time_spent_minutes: number
  average_score: number
}

export interface LearningStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
  streak_start_date: string
}

// ===== PERSONALIZATION TYPES =====
export interface PersonalizedContent {
  user_id: string
  recommended_topics: Topic[]
  recommended_concepts: Concept[]
  personalized_exercises: Exercise[]
  learning_path: LearningPathItem[]
  generated_at: string
}

export interface LearningPathItem {
  id: string
  type: 'topic' | 'concept' | 'exercise'
  content_id: string
  title: string
  description: string
  order: number
  estimated_duration_minutes: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  prerequisites_completed: boolean
  is_completed: boolean
  personalization_reason: string
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  error?: string
}

// ===== REQUEST TYPES =====
export interface PersonalizedContentRequest {
  user_id: string
  interests?: string[]
  learning_goals?: string[]
  difficulty_preference?: 'beginner' | 'intermediate' | 'advanced'
  time_available_minutes?: number
  focus_areas?: string[]
}

export interface ProgressUpdateRequest {
  user_id: string
  topic_id?: string
  section_id?: string
  concept_id?: string
  exercise_id?: string
  time_spent_minutes: number
  completion_percentage?: number
  mastery_level?: 'not_started' | 'learning' | 'practiced' | 'mastered'
  score?: number
} 