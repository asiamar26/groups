/**
 * Database Types
 * Type definitions for database tables and queries
 */

export type Profile = {
  id: string
  fullName: string
  avatarUrl?: string
  title?: string
  company?: string
  location?: string
  bio?: string
  languages: string[]
  createdAt: string
  updatedAt: string
}

export type Group = {
  id: string
  name: string
  description?: string
  category: string
  isPrivate: boolean
  bannerUrl?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type Post = {
  id: string
  content: string
  authorId: string
  groupId: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>
      }
      groups: {
        Row: Group
        Insert: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>
      }
    }
  }
} 