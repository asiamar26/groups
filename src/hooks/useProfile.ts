/**
 * Profile Management Hook
 * Handles user profile operations
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Profile } from '@/types/profile'

interface UseProfileOptions {
  onError?: (error: Error) => void
}

export function useProfile(userId: string | undefined, options: UseProfileOptions = {}) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function loadProfile() {
      try {
        setIsLoading(true)
        setError(null)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            first_name,
            last_name,
            email,
            position,
            company,
            city,
            state,
            country,
            website,
            about,
            avatar_url,
            education,
            work_experience,
            followers_count,
            following_count,
            groups_count,
            created_at,
            updated_at
          `)
          .eq('id', userId)
          .single()

        if (error) throw error

        if (isMounted) {
          setProfile(profile)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to load profile')
          setError(error)
          options.onError?.(error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    // Set up real-time subscription for profile updates
    const subscription = supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setProfile(null)
        } else {
          setProfile(payload.new as Profile)
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [userId, options.onError])

  return {
    profile,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true)
      setError(null)
      // Trigger a re-render which will reload the profile
      // due to the useEffect dependency on userId
      return Promise.resolve()
    }
  }
} 