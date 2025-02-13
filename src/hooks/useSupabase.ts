/**
 * Supabase Hook
 * Custom hook for database operations with proper typing
 */

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/db.types'
import type { PostgrestError } from '@supabase/supabase-js'

export function useSupabase() {
  const getProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }, [])

  const updateProfile = useCallback(async (
    userId: string, 
    updates: Database['public']['Tables']['profiles']['Update']
  ): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    return { error }
  }, [])

  // Add more database operations as needed...

  return {
    getProfile,
    updateProfile,
  }
} 