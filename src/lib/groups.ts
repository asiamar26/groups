import { getSupabaseClient } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/config'
import { Database } from '@/lib/database.types'
import type { GroupWithMemberInfo, GroupMember as Member } from '@/types/groups'

export type Group = {
  id: string
  name: string
  description: string | null
  privacy: GroupPrivacy
  categories: string[] | null
  cover_image: string | null
  member_count: number
  created_by: string | null
  created_at: string
  updated_at: string
  last_activity_at: string
  members?: GroupMemberBasic[]
}

export type GroupMember = Tables<'group_members'>

// Define enums directly since they're not properly typed in the database types
export type GroupPrivacy = 'public' | 'private'
export type GroupMemberStatus = 'pending' | 'active' | 'blocked'
export type GroupMemberRole = 'member' | 'admin' | 'owner'

export type GroupMemberBasic = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: GroupMemberRole
}

interface CreateGroupData {
  name: string
  description: string
  privacy: 'public' | 'private'
  categories: string[]
  coverImage?: string
}

interface UpdateGroupInput {
  name: string
  description: string
  privacy: 'public' | 'private'
  categories: string[]
  coverImage?: string | null
}

export async function createGroup(data: CreateGroupData) {
  try {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

    const now = new Date().toISOString()
    
    // Create the group - the trigger will automatically add the creator as owner
    const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description,
        privacy: data.privacy,
      categories: data.categories,
      cover_image: data.coverImage,
        created_by: user.id,
        last_activity_at: now,
        updated_at: now
      })
      .select(`
        *,
        members:group_members(
          user_id,
          role,
          status,
          profile:profiles(
            email,
            display_name,
            avatar_url
          )
        )
      `)
      .single()

    if (groupError) {
      console.error('Error creating group:', groupError)
      throw groupError
    }

    return { data: group, error: null }
  } catch (error) {
    console.error('Error in createGroup:', error)
    return { data: null, error: error as Error }
  }
}

export async function joinGroup(groupId: string): Promise<{ 
  data: { status: GroupMemberStatus } | null, 
  error: Error | null 
}> {
  try {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

    // First check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("group_members")
      .select('status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking membership:', JSON.stringify(checkError, null, 2))
      throw checkError
    }

    if (existingMember) {
      return { 
        data: { status: existingMember.status }, 
        error: new Error('You are already a member of this group') 
      }
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
    .from("groups")
      .select("privacy")
    .eq("id", groupId)
    .single()

    if (groupError) {
      console.error('Error fetching group:', JSON.stringify(groupError, null, 2))
      throw groupError
    }

    if (!group) {
      throw new Error('Group not found')
    }

    // For private groups, status is pending
    // For public groups, status is active
    const status: GroupMemberStatus = group.privacy === 'private' ? "pending" : "active"

    const { error: insertError } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: user.id,
        role: "member",
      status,
        joined_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error inserting member:', JSON.stringify(insertError, null, 2))
      throw insertError
    }

    return { data: { status }, error: null }
  } catch (error) {
    console.error('Error joining group:', error instanceof Error ? error.message : JSON.stringify(error, null, 2))
    return { data: null, error: error as Error }
  }
}

export async function leaveGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id)

  return { error }
}

export async function getGroups(): Promise<{ data: GroupWithMemberInfo[], error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return { data: [], error: new Error('Not authenticated') }
    }

    // Get groups with member information
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        privacy,
        categories,
        cover_image,
        created_by,
        created_at,
        updated_at,
        last_activity_at,
        members:group_members(
          user_id,
          role,
          status,
          profile:profiles(
            email,
            display_name,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (groupsError) {
      console.error('Database error:', groupsError)
      throw groupsError
    }

    // Transform the data to match GroupInfo type
    const groupsWithInfo = groups.map((group: any) => {
      const currentUserMember = group.members?.find((m: any) => m.user_id === user.id)
      const activeMembers = group.members?.filter((m: any) => m.status === 'active') || []

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        privacy: group.privacy,
        categories: group.categories,
        cover_image: group.cover_image,
        created_at: group.created_at,
        last_activity_at: group.last_activity_at,
        currentUserRole: currentUserMember?.role || null,
        currentUserStatus: currentUserMember?.status || 'none',
        currentUserId: user.id,
        members: activeMembers.map((member: any) => ({
          id: member.user_id,
          email: member.profile?.email,
          display_name: member.profile?.display_name,
          avatar_url: member.profile?.avatar_url,
          role: member.role
        }))
      }
    })

    return { data: groupsWithInfo, error: null }
  } catch (error) {
    console.error('Error getting groups:', error)
    return { data: [], error: error as Error }
  }
}

export async function updateGroup(groupId: string, updates: UpdateGroupInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Check if user is admin/owner
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError) {
      console.error('Error checking membership:', membershipError)
      throw new Error('Failed to verify permissions')
    }

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      throw new Error('You do not have permission to edit this group')
    }

    const { data: group, error: updateError } = await supabase
      .from('groups')
      .update({
        name: updates.name,
        description: updates.description,
        privacy: updates.privacy,
        categories: updates.categories,
        cover_image: updates.coverImage,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select()
      .single()

    if (updateError) throw updateError

    return { data: group, error: null }
  } catch (error) {
    console.error('Error updating group:', error)
    return { data: null, error: error as Error }
  }
} 