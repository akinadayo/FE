export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          study_goal_minutes: number
          target_exam_date: string | null
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          study_goal_minutes?: number
          target_exam_date?: string | null
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          study_goal_minutes?: number
          target_exam_date?: string | null
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      topic_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          explanation_completed: boolean
          explanation_completed_at: string | null
          flashcard_completed: boolean
          flashcard_completed_at: string | null
          flashcard_mastery_level: number
          test_completed: boolean
          test_completed_at: string | null
          total_tests_taken: number
          best_score: number
          latest_score: number
          average_score: number
          last_studied_at: string
          total_study_time_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          explanation_completed?: boolean
          explanation_completed_at?: string | null
          flashcard_completed?: boolean
          flashcard_completed_at?: string | null
          flashcard_mastery_level?: number
          test_completed?: boolean
          test_completed_at?: string | null
          total_tests_taken?: number
          best_score?: number
          latest_score?: number
          average_score?: number
          last_studied_at?: string
          total_study_time_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          explanation_completed?: boolean
          explanation_completed_at?: string | null
          flashcard_completed?: boolean
          flashcard_completed_at?: string | null
          flashcard_mastery_level?: number
          test_completed?: boolean
          test_completed_at?: string | null
          total_tests_taken?: number
          best_score?: number
          latest_score?: number
          average_score?: number
          last_studied_at?: string
          total_study_time_seconds?: number
          created_at?: string
          updated_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          test_type: string
          total_questions: number
          correct_answers: number
          score: number
          time_spent_seconds: number
          answers: Json
          incorrect_subtopics: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          test_type: string
          total_questions: number
          correct_answers: number
          score: number
          time_spent_seconds: number
          answers: Json
          incorrect_subtopics?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          test_type?: string
          total_questions?: number
          correct_answers?: number
          score?: number
          time_spent_seconds?: number
          answers?: Json
          incorrect_subtopics?: string[] | null
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          topic_id: string | null
          session_type: string
          duration_seconds: number
          session_date: string
          session_start_time: string
          session_end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id?: string | null
          session_type: string
          duration_seconds: number
          session_date?: string
          session_start_time: string
          session_end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string | null
          session_type?: string
          duration_seconds?: number
          session_date?: string
          session_start_time?: string
          session_end_time?: string
          created_at?: string
        }
      }
      flashcard_reviews: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          flashcard_id: string
          confidence_level: number
          review_count: number
          easiness_factor: number
          interval_days: number
          next_review_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          flashcard_id: string
          confidence_level: number
          review_count?: number
          easiness_factor?: number
          interval_days?: number
          next_review_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          flashcard_id?: string
          confidence_level?: number
          review_count?: number
          easiness_factor?: number
          interval_days?: number
          next_review_date?: string | null
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: string
          requester_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: string
          requester_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: string
          requester_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          achievement_key: string
          name: string
          description: string
          icon: string | null
          category: string
          requirement: Json
          created_at: string
        }
        Insert: {
          id?: string
          achievement_key: string
          name: string
          description: string
          icon?: string | null
          category: string
          requirement: Json
          created_at?: string
        }
        Update: {
          id?: string
          achievement_key?: string
          name?: string
          description?: string
          icon?: string | null
          category?: string
          requirement?: Json
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_key: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_key: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_key?: string
          earned_at?: string
        }
      }
    }
    Views: {
      weekly_ranking: {
        Row: {
          user_id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          total_minutes: number
          study_days: number
          avg_accuracy: number
        }
      }
      user_statistics: {
        Row: {
          user_id: string
          completed_topics: number
          total_hours: number
          avg_test_score: number
          total_tests_taken: number
          total_study_days: number
          last_study_date: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
