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
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          privacy: 'public' | 'private'
          categories: string[] | null
          cover_image: string | null
          created_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          privacy: 'public' | 'private'
          categories?: string[] | null
          cover_image?: string | null
          created_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          privacy?: 'public' | 'private'
          categories?: string[] | null
          cover_image?: string | null
          created_at?: string
          last_activity_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 