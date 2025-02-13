import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/config';

interface UseFollowSystemProps {
  targetUserId: string;
}

interface UseFollowSystemReturn {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  toggleFollow: () => Promise<void>;
  loading: boolean;
}

interface FollowStatus {
  success: boolean;
  is_following: boolean;
}

interface FollowCounts {
  success: boolean;
  counts: {
    followers: number;
    following: number;
  };
}

interface FollowResponse {
  success: boolean;
  error?: string;
  data?: {
    following_count: number;
    followers_count: number;
  };
}

export function useFollowSystem({ targetUserId }: UseFollowSystemProps): UseFollowSystemReturn {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(false);

  // Get follow status
  const fetchFollowStatus = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_follow_status', {
          _user_id: user.id,
          _target_id: targetUserId
        });

      if (error) throw error;

      const response = data as FollowStatus;
      if (response.success) {
        setIsFollowing(response.is_following);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  }, [user?.id, targetUserId]);

  // Get follow counts
  const fetchFollowCounts = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_follow_counts', {
          _user_id: targetUserId
        });

      if (error) throw error;

      const response = data as FollowCounts;
      if (response.success) {
        setCounts(response.counts);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  }, [targetUserId]);

  // Load initial data
  useEffect(() => {
    fetchFollowStatus();
    fetchFollowCounts();
  }, [fetchFollowStatus, fetchFollowCounts]);

  // Subscribe to follow status changes
  useEffect(() => {
    if (!user?.id || !targetUserId) return;

    const channel = supabase.channel(`followers:${user.id}:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${user.id} AND following_id=eq.${targetUserId}`
        },
        () => {
          fetchFollowStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, targetUserId, fetchFollowStatus]);

  // Subscribe to count changes
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase.channel(`follow_counts:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follow_counts',
          filter: `user_id=eq.${targetUserId}`
        },
        () => {
          fetchFollowCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId, fetchFollowCounts]);

  // Toggle follow status
  const toggleFollow = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (user.id === targetUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    if (loading) return;

    setLoading(true);
    const prevIsFollowing = isFollowing;
    const prevCounts = { ...counts };

    try {
      // Optimistically update UI
      setIsFollowing(!prevIsFollowing);
      setCounts(prev => ({
        followers: prev.followers + (prevIsFollowing ? -1 : 1),
        following: prev.following
      }));

      const { data, error } = await supabase
        .rpc(prevIsFollowing ? 'unfollow_user' : 'follow_user', {
          _follower_id: user.id,
          _following_id: targetUserId
        });

      if (error) throw error;

      const response = data as FollowResponse;
      if (response.success) {
        // Update counts from response if available
        if (response.data) {
          setCounts(prev => ({
            ...prev,
            followers: response.data!.followers_count
          }));
        }
        toast.success(prevIsFollowing ? 'Successfully unfollowed user' : 'Successfully followed user');
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert optimistic updates on error
      setIsFollowing(prevIsFollowing);
      setCounts(prevCounts);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing, loading, counts]);

  return {
    isFollowing,
    followersCount: counts.followers,
    followingCount: counts.following,
    toggleFollow,
    loading
  };
} 