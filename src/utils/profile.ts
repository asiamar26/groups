import { supabase } from '@/lib/supabase/config'
import type { Profile, ProfileResponse, ProfileUpdateInput, ProfileCounts, Education } from '@/types/profile'
import { FollowService } from '@/services/FollowService'

/**
 * Represents a user's profile with all associated data
 */
export interface Profile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  position: string
  company: string | null
  city: string | null
  state: string | null
  country: string | null
  website: string | null
  about: string | null
  avatar_url: string | null
  education: Education[]
  work_experience?: {
    company: string
    position: string
    start_date: string
    end_date?: string
  }[]
  followers_count: number
  following_count: number
  groups_count: number
  created_at: string
  updated_at: string
}

export interface SocialLink {
  platform: string
  username: string
  url: string
  isHidden: boolean
}

export interface ProfileResponse {
  data: Profile | null
  error: Error | null
}

export interface FollowRelation {
  follower_id: string
  following_id: string
}

/**
 * Subscribes to follow-related updates for a specific profile
 * @param profileId The ID of the profile to monitor
 * @param onUpdate Callback function to handle profile updates
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToFollowUpdates(
  profileId: string,
  onUpdate: (profile: Profile) => void
): () => void {
  console.log('Setting up follow subscriptions for profile:', profileId)

  // Subscribe to direct profile changes
  const profileSubscription = supabase
    .channel(`profile-${profileId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${profileId}`
      },
      async (payload) => {
        console.log('Profile updated:', payload)
        if (payload.new) {
          onUpdate(payload.new as Profile)
        }
      }
    )
    .subscribe()

  // Subscribe to being followed/unfollowed
  const followerSubscription = supabase
    .channel(`follower-changes-${profileId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'followers',
        filter: `following_id=eq.${profileId}`
      },
      async (payload) => {
        console.log('Follower changes detected:', payload)
        // Fetch latest profile data since follower count changed
        const { data } = await getProfile(profileId)
        if (data) {
          onUpdate(data)
        }
      }
    )
    .subscribe()

  // Return cleanup function
  return () => {
    console.log('Cleaning up follow subscriptions')
    profileSubscription.unsubscribe()
    followerSubscription.unsubscribe()
  }
}

/**
 * Updates a user's profile
 * @param userId The ID of the user whose profile to update
 * @param updates The profile fields to update
 * @returns Updated profile data and any error that occurred
 */
export async function updateProfile(userId: string, updates: ProfileUpdateInput): Promise<ProfileResponse> {
  try {
    console.log('Updating profile for user:', userId, 'with updates:', updates);
    
    // Filter out undefined values and empty strings
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      // Include the value if it's not undefined and not an empty string
      if (value !== undefined && value !== '') {
        acc[key] = value === '' ? null : value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Cleaned updates:', cleanUpdates);

    // Add updated_at timestamp
    cleanUpdates.updated_at = new Date().toISOString();

    // Perform the update only if there are fields to update
    if (Object.keys(cleanUpdates).length === 0) {
      console.warn('No valid fields to update');
      return {
        data: null,
        error: new Error('No valid fields to update')
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return {
        data: null,
        error: new Error(`Failed to update profile: ${error.message}`)
      };
    }

    if (!data) {
      console.error('No data returned from update');
      return {
        data: null,
        error: new Error('Profile not found')
      };
    }

    // Get the latest counts
    const counts = await getProfileCounts(userId);
    console.log('Updated profile counts:', counts);

    const updatedProfile = {
      ...data,
      followers_count: counts.followers_count,
      following_count: counts.following_count,
      groups_count: counts.groups_count
    } as Profile;

    console.log('Final updated profile:', updatedProfile);

    return {
      data: updatedProfile,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile')
    };
  }
}

/**
 * Gets the current counts for a profile
 * @param userId The ID of the user to get counts for
 * @returns The current follower, following, and group counts
 */
export async function getProfileCounts(userId: string): Promise<ProfileCounts> {
  try {
    const { data, error } = await supabase
      .rpc('get_profile_counts', {
        _user_id: userId
      })

    if (error) throw error

    return {
      followers_count: data.followers_count || 0,
      following_count: data.following_count || 0,
      groups_count: data.groups_count || 0
    }
  } catch (error) {
    console.error('Error getting profile counts:', error)
    return {
      followers_count: 0,
      following_count: 0,
      groups_count: 0
    }
  }
}

/**
 * Gets a profile by ID
 * @param profileId The ID of the profile to get
 * @returns The profile data and any error that occurred
 */
export async function getProfile(profileId: string): Promise<{ data: Profile | null, error: Error | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError) throw profileError

    if (profile) {
      const counts = await getProfileCounts(profileId)

      return {
        data: {
          ...profile,
          followers_count: counts.followers_count,
          following_count: counts.following_count,
          groups_count: counts.groups_count
        } as Profile,
        error: null
      }
    }

    return { data: null, error: new Error('Profile not found') }
  } catch (error) {
    console.error('Error in getProfile:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get profile')
    }
  }
}

/**
 * Creates a new profile
 * @param userId The ID of the user
 * @param profile The initial profile data
 * @returns The created profile data and any error that occurred
 */
export async function createProfile(userId: string, profile: ProfileUpdateInput): Promise<ProfileResponse> {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return updateProfile(userId, profile)
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: profile.email,
        username: profile.username || profile.email?.split('@')[0],
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        position: profile.position || 'Member',
        avatar_url: profile.avatar_url || null,
        followers_count: 0,
        following_count: 0,
        groups_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return { data: data as Profile, error: null }
  } catch (error) {
    console.error('Error in createProfile:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create profile')
    }
  }
}

/**
 * Follows a user
 * @param followerId ID of the user initiating the follow
 * @param followingId ID of the user being followed
 * @returns Any error that occurred
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ error: Error | null }> {
  try {
    const { data, error } = await supabase
      .rpc('follow_user', {
        _follower_id: followerId,
        _following_id: followingId
      })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in followUser:', error)
    return { error: error as Error }
  }
}

/**
 * Unfollows a user
 * @param followerId ID of the user initiating the unfollow
 * @param followingId ID of the user being unfollowed
 * @returns Any error that occurred
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ error: Error | null }> {
  try {
    const { data, error } = await supabase
      .rpc('unfollow_user', {
        _follower_id: followerId,
        _following_id: followingId
      })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in unfollowUser:', error)
    return { error: error as Error }
  }
}

/**
 * Checks if one user is following another
 * @param followerId ID of the potential follower
 * @param followingId ID of the user potentially being followed
 * @returns Boolean indicating follow status
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  return FollowService.isFollowing(followerId, followingId);
}

/**
 * Resets the counts for a specific user
 * @param userId The ID of the user whose counts need to be reset
 * @returns Any error that occurred
 */
export async function resetUserCounts(
  userId: string
): Promise<{ error: Error | null }> {
  try {
    const { data, error } = await supabase
      .rpc('reset_user_counts', {
        _user_id: userId
      })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error in resetUserCounts:', error)
    return { error: error as Error }
  }
}

/**
 * Resets the counts for all users in the system
 */
export async function resetAllProfileCounts(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .rpc('reset_all_profile_counts')

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error resetting all profile counts:', error)
    return { error: error as Error }
  }
}

export async function getProfileStats(userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('followers_count, following_count, groups_count')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    return {
      followersCount: profile?.followers_count || 0,
      followingCount: profile?.following_count || 0,
      groupsCount: profile?.groups_count || 0
    }
  } catch (error) {
    console.error('Error getting profile stats:', error)
    throw error
  }
}

export function subscribeToProfileStats(userId: string, callback: (stats: any) => void) {
  // Subscribe to profile changes
  const subscription = supabase
    .channel('profile_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        if (payload.new) {
          callback({
            followersCount: payload.new.followers_count || 0,
            followingCount: payload.new.following_count || 0,
            groupsCount: payload.new.groups_count || 0
          })
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * Checks if a username is available and valid
 * @param username Username to check
 * @returns Object containing availability status and any validation errors
 */
export async function checkUsername(
  username: string
): Promise<{ 
  isAvailable: boolean; 
  isValid: boolean;
  error?: string 
}> {
  try {
    // Basic validation
    if (!username.match(/^[a-zA-Z0-9._]+$/)) {
      return {
        isAvailable: false,
        isValid: false,
        error: 'Username can only contain letters, numbers, dots, and underscores'
      }
    }

    if (username.length < 3 || username.length > 30) {
      return {
        isAvailable: false,
        isValid: false,
        error: 'Username must be between 3 and 30 characters'
      }
    }

    // Check availability in database
    const { data, error } = await supabase
      .rpc('is_username_available', {
        username_to_check: username.toLowerCase()
      })

    if (error) throw error

    return {
      isAvailable: data.available,
      isValid: true,
      error: data.available ? undefined : 'Username is already taken'
    }
  } catch (error) {
    console.error('Error checking username:', error)
    return {
      isAvailable: false,
      isValid: false,
      error: 'Error checking username availability'
    }
  }
} 