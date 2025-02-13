import { supabase } from '@/lib/supabase/config'
import { Tables } from '@/lib/supabase'

export type Notification = Tables<'notifications'>

export type NotificationType = 'group_join_approved' | 'group_join_rejected' | 'group_invite' | 'group_role_change'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  groupId: string
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries')
}

export async function createNotification(input: CreateNotificationInput) {
  return retryOperation(async () => {
    console.log('Creating notification:', input)
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        group_id: input.groupId
      })

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  })
}

export async function getUserNotifications() {
  return retryOperation(async () => {
    console.log('Getting user notifications')
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      console.log('No authenticated user found')
      return []
    }

    console.log('Fetching notifications for user:', user.user.id)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    console.log('Notifications fetched:', data)
    return data
  })
}

export async function markNotificationAsRead(notificationId: string) {
  return retryOperation(async () => {
    console.log('Marking notification as read:', notificationId)
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  })
}

export async function markAllNotificationsAsRead() {
  return retryOperation(async () => {
    console.log('Marking all notifications as read')
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      console.log('No authenticated user found')
      return
    }

    console.log('Updating notifications for user:', user.user.id)
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  })
}

export async function getUnreadNotificationsCount() {
  return retryOperation(async () => {
    console.log('Getting unread notifications count')
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      console.log('No authenticated user found')
      return 0
    }

    console.log('Counting unread notifications for user:', user.user.id)
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('read', false)

    if (error) {
      console.error('Error counting unread notifications:', error)
      throw error
    }

    console.log('Unread count:', count)
    return count || 0
  })
} 