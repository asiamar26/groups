import { getSupabaseClient } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { supabase } from '@/lib/supabase/config'
import { Database } from '@/lib/database.types'
import type { 
  GroupWithMemberInfo as GroupInfo, 
  GroupMember as Member,
  GroupPrivacy,
  GroupMemberRole,
  GroupMemberStatus
} from '@/types/groups'

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

export type GroupMemberBasic = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: GroupMemberRole
}

interface CreateGroupInput {
  name: string
  description?: string | null
  privacy?: GroupPrivacy
  categories?: string[] | null
  coverImage?: string | null
}

interface GroupResponse<T> {
  data: T | null
  error: Error | null
}

export type GroupWithMemberInfo = {
  id: string
  name: string
  description: string | null
  privacy: 'public' | 'private'
  categories: string[] | null
  cover_image: string | null
  created_at: string
  last_activity_at: string
  currentUserRole: 'member' | 'admin' | 'owner' | null
  currentUserStatus: GroupMemberStatus
  currentUserId: string | null
  members: GroupMember[]
}

type DatabaseGroup = Database['public']['Tables']['groups']['Row']
type DatabaseGroupMember = {
  id: string
  group_id: string
  user_id: string
  role: GroupMemberRole
  created_at: string
}
type DatabaseUser = Database['public']['Tables']['users']['Row']

interface GroupMemberWithUser extends Omit<DatabaseGroupMember, 'group_id'> {
  user_id: string
  role: GroupMemberRole
  status: GroupMemberStatus
  profile: {
    email: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

interface ProfileData {
  email: string | null
  display_name: string | null
  avatar_url: string | null
}

interface RawMemberData {
  group_id: string
  user_id: string
  role: string
  status: string
  profiles: ProfileData | null
}

interface GroupMemberData {
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  status: 'pending' | 'active'
  profiles: ProfileData
}

interface GroupData {
  id: string
  name: string
  description: string | null
  privacy: 'public' | 'private'
  categories: string[] | null
  cover_image: string | null
  created_at: string
  last_activity_at: string
}

interface GroupMemberWithProfile {
  user_id: string
  role: GroupMemberRole
  status: GroupMemberStatus
  profiles: {
    email: string | null
    display_name: string | null
    avatar_url: string | null
  }
}

interface GroupWithMembers {
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
  members: GroupMemberWithProfile[]
}

export async function getGroups(): Promise<{ data: GroupInfo[], error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return { data: [], error: new Error('Not authenticated') }
    }

    // First get the groups
    const { data: rawGroups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        privacy,
        categories,
        cover_image,
        created_at,
        last_activity_at
      `)
      .order('created_at', { ascending: false })

    if (groupsError) {
      console.error('Database error:', groupsError)
      throw groupsError
    }

    const groups = rawGroups as unknown as GroupData[]

    // Then get the members for these groups
    const groupIds = groups.map(g => g.id)
    const { data: rawMembers, error: membersError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        user_id,
        role,
        status,
        profiles:user_id(
          email,
          display_name,
          avatar_url
        )
      `)
      .in('group_id', groupIds)

    if (membersError) {
      console.error('Database error:', membersError)
      throw membersError
    }

    const members = ((rawMembers as unknown as RawMemberData[]) || []).map(member => ({
      group_id: member.group_id,
      user_id: member.user_id,
      role: member.role as 'admin' | 'member',
      status: member.status as 'pending' | 'active',
      profiles: {
        email: member.profiles?.email || null,
        display_name: member.profiles?.display_name || null,
        avatar_url: member.profiles?.avatar_url || null
      }
    })) as GroupMemberData[]

    // Map members to their respective groups
    const groupsWithMemberInfo = groups.map(group => {
      const groupMembers = members.filter(m => m.group_id === group.id)
      const currentUserMember = groupMembers.find(m => m.user_id === user.id)

      const formattedMembers: Member[] = groupMembers.map(member => ({
        id: member.user_id,
        email: member.profiles.email,
        display_name: member.profiles.display_name,
        avatar_url: member.profiles.avatar_url,
        role: member.role
      }))

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        privacy: group.privacy as 'public' | 'private',
        categories: group.categories,
        cover_image: group.cover_image,
        created_at: group.created_at,
        last_activity_at: group.last_activity_at,
        currentUserRole: currentUserMember?.role || null,
        currentUserStatus: currentUserMember?.status || 'none',
        currentUserId: user.id,
        members: formattedMembers
      } as GroupInfo
    })

    return { data: groupsWithMemberInfo, error: null }
  } catch (error) {
    console.error('Error getting groups:', error)
    return { data: [], error: error as Error }
  }
}

export async function getGroup(groupId: string): Promise<GroupResponse<Group>> {
  try {
    const supabase = getSupabaseClient()
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(
          user_id,
          role,
          status
        )
      `)
      .eq('id', groupId)
      .single()

    if (error) throw error

    return { data: group, error: null }
  } catch (error) {
    console.error('Error fetching group:', error)
    return { data: null, error: error as Error }
  }
}

export async function createGroup(input: CreateGroupInput): Promise<GroupResponse<Group>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const now = new Date().toISOString()
    
    // Create the group - the trigger will automatically add the creator as admin
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: input.name,
        description: input.description || null,
        privacy: input.privacy || 'public',
        categories: input.categories || [],
        cover_image: input.coverImage || null,
        created_by: user.id,
        last_activity_at: now,
        updated_at: now
      })
      .select('*')
      .single()

    if (groupError) {
      console.error('Error creating group:', groupError)
      throw groupError
    }

    return { data: group, error: null }
  } catch (error) {
    console.error('Error creating group:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateGroup(
  groupId: string,
  updates: Partial<CreateGroupInput>
): Promise<GroupResponse<Group>> {
  try {
    const supabase = getSupabaseClient()
    const { data: group, error } = await supabase
      .from('groups')
      .update({
        ...updates,
        cover_image: updates.coverImage,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select()
      .single()

    if (error) throw error

    return { data: group, error: null }
  } catch (error) {
    console.error('Error updating group:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateGroupLastActivity(groupId: string): Promise<GroupResponse<boolean>> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('groups')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', groupId)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating group activity:', error)
    return { data: null, error: error as Error }
  }
}

export async function deleteGroup(groupId: string): Promise<GroupResponse<boolean>> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    console.error('Error deleting group:', error)
    return { data: null, error: error as Error }
  }
}

export async function getGroupMembers(groupId: string): Promise<GroupResponse<GroupMember[]>> {
  try {
    const supabase = getSupabaseClient()
    const { data: members, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (error) throw error

    return { data: members, error: null }
  } catch (error) {
    console.error('Error fetching group members:', error)
    return { data: null, error: error as Error }
  }
}

export async function getGroupJoinRequests(groupId: string): Promise<GroupMember[]> {
  const supabase = getSupabaseClient()
  
  // First get the pending members
  const { data: members, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('joined_at', { ascending: true })

  if (error) throw error

  // Then get their profile information
  if (members && members.length > 0) {
    const userIds = members.map(member => member.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Combine the data
    const membersWithProfiles = members.map(member => ({
      ...member,
      user: profiles?.find(profile => profile.id === member.user_id)
    }))

    return membersWithProfiles
  }

  return members || []
}

export async function joinGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // First check if user is already a member
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("status, role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return { error: new Error("Already a member of this group") }
  }

  const { data: group } = await supabase
    .from("groups")
    .select("privacy, created_by")
    .eq("id", groupId)
    .single()

  if (!group) throw new Error("Group not found")
  
  // Cannot directly join secret groups
  if (group.privacy === 'secret') {
    throw new Error("This group requires an invitation to join")
  }

  // If user is the creator, they should already be an admin member due to the database trigger
  if (group.created_by === user.id) {
    return { error: null }
  }

  // For non-creators: public groups get active status, private groups get pending
  const status: GroupMemberStatus = group.privacy === 'public' ? 'active' : 'pending'

  const { error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
      status,
      joined_at: new Date().toISOString()
    })

  return { error }
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

export async function updateMemberRole(
  groupId: string,
  userId: string,
  role: GroupMemberRole
): Promise<GroupResponse<GroupMember>> {
  try {
    const supabase = getSupabaseClient()
    const { data: member, error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { data: member, error: null }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateMemberStatus(
  groupId: string,
  userId: string,
  status: GroupMemberStatus
): Promise<GroupResponse<GroupMember>> {
  try {
    const supabase = getSupabaseClient()
    const { data: member, error } = await supabase
      .from('group_members')
      .update({ status })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { data: member, error: null }
  } catch (error) {
    console.error('Error updating member status:', error)
    return { data: null, error: error as Error }
  }
}

// Search groups with enhanced info
export async function searchGroups(query: string): Promise<{ data: GroupInfo[], error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return { data: [], error: new Error('Not authenticated') }
    }
    
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(
          user_id,
          role,
          status,
          users:user_id(
            email,
            display_name,
            avatar_url
          )
        )
      `)
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .neq('privacy', 'secret') // Exclude secret groups from search
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Raw search results:', groups)

    const groupsWithMemberInfo = groups.map((group: any) => {
      const currentUserMember = group.members?.find((member: any) => member.user_id === user.id)
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
        members: group.members?.map((member: any) => ({
          id: member.user_id,
          email: member.users.email,
          display_name: member.users.display_name,
          avatar_url: member.users.avatar_url,
          role: member.role
        })) || []
      } as GroupInfo
    })

    return { data: groupsWithMemberInfo, error: null }
  } catch (error) {
    console.error('Error in searchGroups:', error)
    return { data: [], error: error instanceof Error ? error : new Error('Failed to search groups') }
  }
}

// Get detailed group info
export async function getGroupDetails(groupId: string): Promise<{ data: GroupInfo | null, error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: group, error } = await supabase
      .from('groups')
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
      .eq('id', groupId)
      .single()

    if (error) throw error

    const groupWithMembers = group as DatabaseGroup & { members: GroupMemberWithUser[] }
    const currentUserMember = groupWithMembers.members?.find(member => member.user_id === user?.id)
    
    const groupWithMemberInfo: GroupInfo = {
      ...groupWithMembers,
      currentUserRole: currentUserMember?.role || null,
      currentUserStatus: currentUserMember ? 'active' : 'none',
      currentUserId: user?.id || null,
      members: groupWithMembers.members?.map(member => ({
        id: member.user_id,
        email: member.profile?.email || null,
        display_name: member.profile?.display_name || null,
        avatar_url: member.profile?.avatar_url || null,
        role: member.role
      })) || []
    }

    return { data: groupWithMemberInfo, error: null }
  } catch (error) {
    console.error('Error getting group details:', error)
    return { data: null, error: error as Error }
  }
}

type GroupRole = 'member' | 'admin';

/**
 * Checks if the current user has a specific role in a group
 * @param groupId The group ID to check
 * @param requiredRole The minimum role required
 * @returns Boolean indicating if user has the required role
 */
export async function hasGroupRole(
  groupId: string,
  requiredRole: GroupMemberRole = 'member'
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return false

  const { data, error } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.user.id)
    .eq('status', 'active')
    .single()

  if (error) return false

  const roleHierarchy: Record<GroupMemberRole, number> = {
    member: 1,
    admin: 2
  } as const

  const userRoleLevel = roleHierarchy[data.role as GroupMemberRole] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

export async function getUserGroupRole(groupId: string): Promise<GroupMemberRole | null> {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data, error } = await supabase
    .from('group_members')
    .select('role, status')
    .eq('group_id', groupId)
    .eq('user_id', user.user.id)
    .single()

  if (error) return null
  return data.status === 'active' ? data.role : null
}

export async function inviteToGroup(groupId: string, userId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: new Error('You must be logged in to invite members') }
    }

    // Check if inviter is admin
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError) {
      console.error('Error checking membership:', membershipError)
      return { error: new Error('Failed to verify permissions') }
    }

    if (!membership || membership.role !== 'admin') {
      return { error: new Error('Only admins can invite members') }
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from('group_members')
      .select('status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      return { error: new Error('User is already a member or has a pending invitation') }
    }

    const { error: inviteError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        status: 'pending',
        joined_at: new Date().toISOString()
      })

    if (inviteError) {
      console.error('Error sending invitation:', inviteError)
      return { error: new Error('Failed to send invitation') }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in inviteToGroup:', error)
    return { error: error instanceof Error ? error : new Error('Failed to invite member') }
  }
}

export async function removeMember(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  // Check if current user has permission
  const { data: currentMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.user.id)
    .eq('status', 'active')
    .single()

  if (!currentMember || !['admin', 'moderator'].includes(currentMember.role)) {
    throw new Error('No permission to remove members')
  }

  // Check if target is last admin
  const { data: targetMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (targetMember?.role === 'admin') {
    const { count: adminCount } = await supabase
      .from('group_members')
      .select('role', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('role', 'admin')
      .eq('status', 'active')

    if (adminCount === 1) throw new Error('Cannot remove last admin')
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) throw error
}

// Helper function to check if user has required permissions
export async function hasGroupPermission(
  groupId: string,
  requiredRole: GroupMemberRole = 'member'
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return false

  const { data, error } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.user.id)
    .eq('status', 'active')
    .single()

  if (error) return false

  const roleHierarchy = {
    member: 1,
    admin: 2
  } as const

  const userRoleLevel = roleHierarchy[data.role as keyof typeof roleHierarchy] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

// Group permission check functions
export const isGroupMember = (groupId: string): Promise<boolean> => 
  hasGroupPermission(groupId, 'member')

export const isGroupAdmin = (groupId: string): Promise<boolean> => 
  hasGroupPermission(groupId, 'admin') 