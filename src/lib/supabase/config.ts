/**
 * Supabase Configuration
 * Central configuration for Supabase client with proper singleton pattern
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'app-auth-token', // Unique storage key
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      db: {
        schema: 'public'
      }
    })
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()

export type SupabaseClient = typeof supabase 