import { supabase } from '@/lib/supabase/config'
import { Database } from '@/lib/database.types'
import { 
  Discussion, 
  DiscussionReply, 
  Attachment, 
  CreateDiscussionInput, 
  CreateDiscussionReplyInput,
  UpdateDiscussionInput 
} from '@/types/discussions'

// Re-export the types for backward compatibility
export type { 
  Discussion, 
  DiscussionReply, 
  Attachment, 
  CreateDiscussionInput, 
  CreateDiscussionReplyInput,
  UpdateDiscussionInput 
} from '@/types/discussions'

export async function createDiscussion(
  groupId: string,
  content: string,
  title?: string,
  attachments?: File[]
): Promise<{ data: Discussion | null, error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create the discussion
    const { data: discussion, error } = await supabase
      .from('discussions')
      .insert({
        group_id: groupId,
        user_id: user.id,
        title: title || '',
        content,
        status: 'active'
      })
      .select(`
        *,
        user:user_id (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // Handle file uploads if any
    let uploadedAttachments: Attachment[] = []
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${discussion.id}/${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('discussion-attachments')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('discussion-attachments')
          .getPublicUrl(filePath)

        uploadedAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        })
      }

      // Update discussion with attachments
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ attachments: uploadedAttachments })
        .eq('id', discussion.id)

      if (updateError) throw updateError
    }

    const formattedDiscussion: Discussion = {
      id: discussion.id,
      groupId: discussion.group_id,
      userId: discussion.user_id,
      title: discussion.title,
      content: discussion.content,
      status: discussion.status,
      attachments: uploadedAttachments,
      likesCount: 0,
      repliesCount: 0,
      createdAt: discussion.created_at,
      updatedAt: discussion.updated_at,
      user: {
        id: discussion.user.id,
        email: discussion.user.email,
        displayName: discussion.user.display_name,
        avatarUrl: discussion.user.avatar_url
      },
      isLiked: false
    }

    return { data: formattedDiscussion, error: null }
  } catch (error) {
    console.error('Error creating discussion:', error)
    return { data: null, error: error as Error }
  }
}

export async function getDiscussionReplies(discussionId: string): Promise<{ data: DiscussionReply[], error: Error | null }> {
  try {
    const { data: replies, error } = await supabase
      .from('discussion_replies')
      .select(`
        *,
        user:user_id (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const formattedReplies: DiscussionReply[] = replies.map(reply => ({
      id: reply.id,
      discussionId: reply.discussion_id,
      userId: reply.user_id,
      content: reply.content,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      user: {
        id: reply.user.id,
        email: reply.user.email,
        displayName: reply.user.display_name,
        avatarUrl: reply.user.avatar_url
      }
    }))

    return { data: formattedReplies, error: null }
  } catch (error) {
    console.error('Error getting discussion replies:', error)
    return { data: [], error: error as Error }
  }
}

export async function createDiscussionReply(discussionId: string, content: string): Promise<{ data: DiscussionReply | null, error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: reply, error } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: discussionId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        user:user_id (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    const formattedReply: DiscussionReply = {
      id: reply.id,
      discussionId: reply.discussion_id,
      userId: reply.user_id,
      content: reply.content,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      user: {
        id: reply.user.id,
        email: reply.user.email,
        displayName: reply.user.display_name,
        avatarUrl: reply.user.avatar_url
      }
    }

    return { data: formattedReply, error: null }
  } catch (error) {
    console.error('Error creating discussion reply:', error)
    return { data: null, error: error as Error }
  }
}

export async function toggleDiscussionLike(discussionId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if the user has already liked the discussion
    const { data: existingLike, error: checkError } = await supabase
      .from('discussion_likes')
      .select()
      .eq('discussion_id', discussionId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existingLike) {
      // Unlike
      const { error: unlikeError } = await supabase
        .from('discussion_likes')
        .delete()
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)

      if (unlikeError) throw unlikeError
    } else {
      // Like
      const { error: likeError } = await supabase
        .from('discussion_likes')
        .insert({
          discussion_id: discussionId,
          user_id: user.id
        })

      if (likeError) throw likeError
    }

    return { error: null }
  } catch (error) {
    console.error('Error toggling discussion like:', error)
    return { error: error as Error }
  }
}

export async function getGroupDiscussions(groupId: string): Promise<{ data: Discussion[], error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: discussions, error } = await supabase
      .from('discussions_with_users')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get likes for the current user
    const { data: userLikes } = await supabase
      .from('discussion_likes')
      .select('discussion_id')
      .eq('user_id', user.id)
      .in('discussion_id', discussions.map(d => d.id))

    const userLikedDiscussions = new Set(userLikes?.map(like => like.discussion_id) || [])

    const formattedDiscussions: Discussion[] = discussions.map(discussion => ({
      id: discussion.id,
      groupId: discussion.group_id,
      userId: discussion.user_id,
      title: discussion.title,
      content: discussion.content,
      attachments: discussion.attachments || [],
      status: discussion.status,
      likesCount: discussion.likes_count,
      repliesCount: discussion.replies_count,
      createdAt: discussion.created_at,
      updatedAt: discussion.updated_at,
      user: {
        id: discussion.user_id,
        email: discussion.email,
        displayName: discussion.display_name,
        avatarUrl: discussion.avatar_url
      },
      isLiked: userLikedDiscussions.has(discussion.id)
    }))

    return { data: formattedDiscussions, error: null }
  } catch (error) {
    console.error('Error getting discussions:', error)
    return { data: [], error: error as Error }
  }
} 