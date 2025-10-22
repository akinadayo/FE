import { Database } from './database.types'

// Database table types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type TopicProgress = Database['public']['Tables']['topic_progress']['Row']
export type TestResult = Database['public']['Tables']['test_results']['Row']
export type StudySession = Database['public']['Tables']['study_sessions']['Row']
export type FlashcardReview = Database['public']['Tables']['flashcard_reviews']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type TopicProgressInsert = Database['public']['Tables']['topic_progress']['Insert']
export type TestResultInsert = Database['public']['Tables']['test_results']['Insert']
export type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']
export type FlashcardReviewInsert = Database['public']['Tables']['flashcard_reviews']['Insert']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type TopicProgressUpdate = Database['public']['Tables']['topic_progress']['Update']

// View types
export type WeeklyRanking = Database['public']['Views']['weekly_ranking']['Row']
export type UserStatistics = Database['public']['Views']['user_statistics']['Row']

// Syllabus types (from fe_syllabus.json)
export interface SyllabusData {
  試験名: string
  シラバスバージョン: string
  最終更新日: string
  説明: string
  大分類: Category[]
}

export interface Category {
  id: string
  名称: string
  説明: string
  中分類: MidCategory[]
}

export interface MidCategory {
  id: string
  名称: string
  小分類: SubCategory[]
}

export interface SubCategory {
  id: string
  名称: string
  トピック: Topic[]
}

export interface Topic {
  id: string
  タイトル: string
  内容: string[]
  キーワード: string[]
}

// Flashcard types
export interface FlashcardData {
  topicId: string
  flashcards: Flashcard[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
  importance: number // 1-5
}

// Question types
export interface QuestionData {
  topicId: string
  questions: Question[]
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'text_input'
  question: string
  options?: string[] // for multiple_choice
  correct_answer: string
  explanation: string
}

// Test answer type
export interface TestAnswer {
  question_id: string
  question_text: string
  question_type: 'multiple_choice' | 'text_input'
  user_answer: string
  correct_answer: string
  is_correct: boolean
  time_spent: number
}

// Session types
export type SessionType = 'explanation' | 'flashcard' | 'test'

// Friendship status
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked'

// Achievement category
export type AchievementCategory = 'streak' | 'accuracy' | 'completion' | 'social'

// Screen navigation types
export type Screen =
  | 'home'
  | 'learning'
  | 'unitDetail'
  | 'explanation'
  | 'flashcard'
  | 'test'
  | 'testResult'
  | 'statistics'
  | 'friends'
  | 'settings'
  | 'profile'

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface TopicProgressWithDetails extends TopicProgress {
  topic?: Topic
}

export interface FriendWithStats extends Profile {
  weekly_study_time: number
  avg_score: number
}
