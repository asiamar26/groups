// Common types that can be reused
export type GroupPrivacy = 'public' | 'private' | 'secret'
export type GroupMemberRole = 'member' | 'admin' | 'moderator'
export type GroupMemberStatus = 'pending' | 'active' | 'blocked' | 'none'

export interface Group {
  id: string
  name: string
  description: string | null
  privacy: GroupPrivacy
  categories: string[] | null
  cover_image: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  last_activity_at: string
  member_count?: number
  members?: GroupMember[]
}

export interface GroupMember {
  id: string
  group_id?: string
  user_id?: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: GroupMemberRole
  status?: GroupMemberStatus
  joined_at?: string
  created_at?: string
  updated_at?: string
  profile?: {
    email: string | null
    display_name: string | null
    avatar_url: string | null
  }
}

export interface GroupWithMemberInfo {
  id: string
  name: string
  description: string | null
  privacy: GroupPrivacy
  categories: string[] | null
  cover_image: string | null
  created_at: string
  last_activity_at: string
  currentUserRole: GroupMemberRole | null
  currentUserStatus: GroupMemberStatus
  currentUserId: string | null
  members: GroupMember[]
} 