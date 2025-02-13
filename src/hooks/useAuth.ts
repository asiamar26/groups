import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail } from '@/utils/auth'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthResponse {
  user: User | null
  error: Error | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  })

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { user, error } = await signInWithEmail(email, password)
      if (error) throw error
      setState(prev => ({ ...prev, user, loading: false }))
      return { user, error: null }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      return { user: null, error }
    }
  }, [])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      // Implement logout logic here
      setState({ user: null, loading: false, error: null })
      router.push('/login')
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false,
      }))
    }
  }, [router])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
  }
} 