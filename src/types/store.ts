import type { Profile } from './profile'
import type { Group, GroupMember } from './groups'
import type { Discussion, DiscussionReply } from './discussions'
import type { Notification } from './api'

/**
 * Auth Store State
 */
export interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, data?: Partial<Profile>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

/**
 * UI Store State
 */
export interface Theme {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontSize: number
  spacing: number
}

export interface UIState {
  theme: Theme
  isSidebarOpen: boolean
  isSearchOpen: boolean
  activeModal: string | null
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    duration?: number
  }>
  setTheme: (theme: Partial<Theme>) => void
  toggleSidebar: () => void
  toggleSearch: () => void
  setActiveModal: (id: string | null) => void
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void
  removeToast: (id: string) => void
}

/**
 * Groups Store State
 */
export interface GroupsState {
  groups: Group[]
  currentGroup: Group | null
  members: GroupMember[]
  isLoading: boolean
  error: Error | null
  fetchGroups: () => Promise<void>
  fetchGroup: (id: string) => Promise<void>
  createGroup: (data: Partial<Group>) => Promise<void>
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  joinGroup: (id: string) => Promise<void>
  leaveGroup: (id: string) => Promise<void>
  fetchMembers: (groupId: string) => Promise<void>
}

/**
 * Discussions Store State
 */
export interface DiscussionsState {
  discussions: Discussion[]
  currentDiscussion: Discussion | null
  replies: Record<string, DiscussionReply[]>
  isLoading: boolean
  error: Error | null
  fetchDiscussions: (groupId: string) => Promise<void>
  fetchDiscussion: (id: string) => Promise<void>
  createDiscussion: (data: Partial<Discussion>) => Promise<void>
  updateDiscussion: (id: string, data: Partial<Discussion>) => Promise<void>
  deleteDiscussion: (id: string) => Promise<void>
  fetchReplies: (discussionId: string) => Promise<void>
  addReply: (discussionId: string, content: string) => Promise<void>
  toggleLike: (discussionId: string) => Promise<void>
}

/**
 * Notifications Store State
 */
export interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: Error | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

/**
 * Search Store State
 */
export interface SearchState {
  query: string
  results: {
    groups?: Group[]
    discussions?: Discussion[]
    members?: Profile[]
  }
  isLoading: boolean
  error: Error | null
  setQuery: (query: string) => void
  search: () => Promise<void>
  clearResults: () => void
}

/**
 * Combined Store State
 */
export interface RootState {
  auth: AuthState
  ui: UIState
  groups: GroupsState
  discussions: DiscussionsState
  notifications: NotificationsState
  search: SearchState
}

/**
 * Store Selectors
 */
export interface StoreSelectors {
  selectUser: () => Profile | null
  selectIsAuthenticated: () => boolean
  selectCurrentGroup: () => Group | null
  selectGroupMembers: () => GroupMember[]
  selectCurrentDiscussion: () => Discussion | null
  selectDiscussionReplies: (discussionId: string) => DiscussionReply[]
  selectUnreadNotifications: () => number
  selectTheme: () => Theme
}

/**
 * Store Actions
 */
export interface StoreActions {
  resetStore: () => void
  hydrateStore: () => Promise<void>
  persistStore: () => Promise<void>
} 