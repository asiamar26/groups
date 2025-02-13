import { Profile } from './profile'

export type DiscussionStatus = 'active' | 'archived' | 'deleted'

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

export interface Discussion {
  id: string
  groupId: string
  userId: string
  title: string
  content: string
  status: DiscussionStatus
  attachments: Attachment[]
  likesCount: number
  repliesCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
  isLiked?: boolean
}

export interface DiscussionReply {
  id: string
  discussionId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export interface CreateDiscussionInput {
  groupId: string
  title: string
  content: string
  attachments?: File[]
}

export interface CreateDiscussionReplyInput {
  discussionId: string
  content: string
}

export interface UpdateDiscussionInput {
  title?: string
  content?: string
  status?: DiscussionStatus
  attachments?: Attachment[]
}

export interface DiscussionWithUser extends Omit<Discussion, 'user'> {
  user: {
    id: string
    email: string | null
    displayName: string | null
    avatarUrl: string | null
  }
} 