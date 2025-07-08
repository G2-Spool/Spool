// Base module interface
export interface BaseModule {
  id: string
  type: string
  order: number
}

// Text module for lecture content
export interface TextModule extends BaseModule {
  type: 'text'
  content: string
  title?: string
}

// Quote module for important quotes
export interface QuoteModule extends BaseModule {
  type: 'quote'
  content: string
  author?: string
  citation?: string
}

// LaTeX equation module
export interface LatexModule extends BaseModule {
  type: 'latex'
  equation: string
  title?: string
  description?: string
}

// PNG diagram with caption
export interface DiagramModule extends BaseModule {
  type: 'diagram'
  imageUrl: string
  caption: string
  alt?: string
}

// YouTube embedded video
export interface YouTubeModule extends BaseModule {
  type: 'youtube'
  videoId: string
  title?: string
  description?: string
  startTime?: number
  endTime?: number
}

// Assignment module with special functionality
export interface AssignmentModule extends BaseModule {
  type: 'assignment'
  title: string
  description?: string
  modules: LearningModule[]
  isCompleted: boolean
  isCollapsed: boolean
  chatInput?: string
  userResponse?: string
  feedback?: string
}

// Union type for all module types
export type LearningModule = 
  | TextModule 
  | QuoteModule 
  | LatexModule 
  | DiagramModule 
  | YouTubeModule 
  | AssignmentModule

// Concept with completion status
export interface ConceptItem {
  id: string
  title: string
  description?: string
  completed: boolean
  locked: boolean
  progress: number
  modules: LearningModule[]
}

// Learning content structure
export interface LearningContent {
  conceptId: string
  title: string
  description?: string
  modules: LearningModule[]
  concepts: ConceptItem[]
} 