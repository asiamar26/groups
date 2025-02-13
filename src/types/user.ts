export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username: string
  avatar_url?: string
  bio?: string
  posts_count?: number
  privacy_settings?: {
    hide_email: boolean
    approve_followers: boolean
    show_activity: boolean
    allow_messages: boolean
  }
  created_at: string
  updated_at: string
} 