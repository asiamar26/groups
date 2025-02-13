import type { Profile } from './profile'
import type { Group, GroupMember } from './groups'
import type { Discussion, DiscussionReply } from './discussions'

/**
 * Generic API Response type
 */
export interface ApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  metadata?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

/**
 * API Error type
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  status?: number
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  include?: string[]
}

/**
 * Auth API Types
 */
export interface SignUpRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  username?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse {
  session: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  user: Profile
}

/**
 * Profile API Types
 */
export interface UpdateProfileRequest {
  username?: string
  firstName?: string
  lastName?: string
  avatar?: File
  bio?: string
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
}

export interface ProfileResponse {
  profile: Profile
  stats?: {
    posts: number
    followers: number
    following: number
  }
}

/**
 * Group API Types
 */
export interface CreateGroupRequest {
  name: string
  description?: string
  privacy?: 'public' | 'private'
  categories?: string[]
  coverImage?: File
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  privacy?: 'public' | 'private'
  categories?: string[]
  coverImage?: File | null
}

export interface GroupResponse {
  group: Group
  members: GroupMember[]
  currentUserRole?: 'member' | 'admin' | 'owner' | null
}

export interface GroupListResponse {
  groups: Group[]
  metadata: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

/**
 * Discussion API Types
 */
export interface CreateDiscussionRequest {
  groupId: string
  title: string
  content: string
  attachments?: File[]
}

export interface UpdateDiscussionRequest {
  title?: string
  content?: string
  attachments?: File[]
}

export interface DiscussionResponse {
  discussion: Discussion
  replies: DiscussionReply[]
  metadata: {
    totalReplies: number
    totalLikes: number
    isLiked: boolean
  }
}

/**
 * File Upload Types
 */
export interface FileUploadResponse {
  url: string
  path: string
  filename: string
  size: number
  mimeType: string
}

/**
 * Notification Types
 */
export interface Notification {
  id: string
  type: 'mention' | 'reply' | 'like' | 'follow' | 'invite'
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

export interface NotificationResponse {
  notifications: Notification[]
  unreadCount: number
  metadata: {
    total: number
    page: number
    limit: number
  }
}

/**
 * WebSocket Event Types
 */
export type WebSocketEvent = 
  | { type: 'discussion.created'; payload: Discussion }
  | { type: 'discussion.updated'; payload: Discussion }
  | { type: 'discussion.deleted'; payload: { id: string } }
  | { type: 'reply.created'; payload: DiscussionReply }
  | { type: 'notification.created'; payload: Notification }
  | { type: 'group.updated'; payload: Group }
  | { type: 'member.joined'; payload: GroupMember }
  | { type: 'member.left'; payload: { groupId: string; userId: string } }

/**
 * API Routes type
 */
export type ApiRoutes = {
  auth: {
    signUp: '/api/auth/signup'
    signIn: '/api/auth/signin'
    signOut: '/api/auth/signout'
    resetPassword: '/api/auth/reset-password'
    verifyEmail: '/api/auth/verify-email'
  }
  profile: {
    get: '/api/profile'
    update: '/api/profile'
    avatar: '/api/profile/avatar'
  }
  groups: {
    list: '/api/groups'
    create: '/api/groups'
    get: '/api/groups/:id'
    update: '/api/groups/:id'
    delete: '/api/groups/:id'
    members: '/api/groups/:id/members'
    join: '/api/groups/:id/join'
    leave: '/api/groups/:id/leave'
  }
  discussions: {
    list: '/api/groups/:groupId/discussions'
    create: '/api/groups/:groupId/discussions'
    get: '/api/discussions/:id'
    update: '/api/discussions/:id'
    delete: '/api/discussions/:id'
    replies: '/api/discussions/:id/replies'
    like: '/api/discussions/:id/like'
  }
  notifications: {
    list: '/api/notifications'
    markRead: '/api/notifications/read'
    delete: '/api/notifications/:id'
  }
} 