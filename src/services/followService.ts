import { supabase } from '@/lib/supabase/config';
import type { Profile } from '@/utils/profile';

export interface FollowResponse {
  success: boolean;
  error: Error | null;
}

export class FollowService {
  /**
   * Follow a user
   * @param followerId - ID of the user who is following
   * @param followingId - ID of the user being followed
   */
  static async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      // Don't allow self-following
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      const { error } = await supabase
        .from('followers')
        .insert([
          { follower_id: followerId, following_id: followingId }
        ]);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error following user:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to follow user')
      };
    }
  }

  /**
   * Unfollow a user
   * @param followerId - ID of the user who is unfollowing
   * @param followingId - ID of the user being unfollowed
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .match({ 
          follower_id: followerId, 
          following_id: followingId 
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to unfollow user')
      };
    }
  }

  /**
   * Check if a user is following another user
   * @param followerId - ID of the potential follower
   * @param followingId - ID of the user being checked
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .match({ 
          follower_id: followerId, 
          following_id: followingId 
        })
        .single();

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get follower and following counts for a user
   * @param userId - ID of the user
   */
  static async getFollowCounts(userId: string): Promise<{ 
    followersCount: number; 
    followingCount: number; 
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        followersCount: data.followers_count || 0,
        followingCount: data.following_count || 0
      };
    } catch (error) {
      console.error('Error getting follow counts:', error);
      return { followersCount: 0, followingCount: 0 };
    }
  }

  /**
   * Subscribe to profile changes for real-time updates
   * @param userId - ID of the user to subscribe to
   * @param onUpdate - Callback function when profile is updated
   */
  static subscribeToProfile(
    userId: string,
    onUpdate: (profile: Partial<Profile>) => void
  ): (() => void) {
    const subscription = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          onUpdate(payload.new as Partial<Profile>);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }
} 