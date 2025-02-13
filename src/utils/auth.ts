/**
 * Authentication utility functions for GroupConnect
 * Handles user authentication state and session management using Supabase
 */

import { supabase } from '@/lib/supabase/config'
import type { AuthError, User } from '@supabase/supabase-js'
import type { PostgrestError } from '@supabase/supabase-js'
import { createProfile } from './profile'

interface AuthResponse {
  user: User | null
  error: Error | null
}

/**
 * Sign in with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Object containing user data or error
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log('Attempting to sign in with email...')
    
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Sign in response:', { session, error })

    if (error) {
      console.error('Sign in error:', error)
      throw error
    }

    if (!session) {
      console.error('No session returned')
      throw new Error('No session returned')
    }

    console.log('Successfully signed in with session:', session.user)
    return {
      user: session.user,
      error: null,
    }
  } catch (err) {
    console.error('Sign in error caught:', err)
    return {
      user: null,
      error: err instanceof Error ? err : new Error('An error occurred during sign in'),
    }
  }
}

/**
 * Sign up with email and password and create initial profile
 * @param email User's email address
 * @param password User's password
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Object containing user data or error
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ user: User | null; error: AuthError | PostgrestError | null }> {
  try {
    console.log('Starting signUpWithEmail...', { email, firstName, lastName })

    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('Supabase auth response:', { authData, authError })

    if (authError) {
      console.error('Auth error:', authError)
      return { user: null, error: authError }
    }

    if (!authData.user) {
      console.error('No user data returned from Supabase')
      return { user: null, error: new Error('No user data returned') as AuthError }
    }

    // Wait a bit to ensure the user is created in the auth system
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create profile with first name and last name
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      social_links: []
    }

    const { error: profileError } = await createProfile(authData.user.id, profileData)
    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { user: null, error: profileError }
    }

    // Try to sign in immediately
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Auto sign-in error:', signInError)
      // Don't return error, user can still sign in manually
    }

    return { user: authData.user, error: null }
  } catch (err) {
    console.error('Signup error:', err)
    return { 
      user: null, 
      error: err instanceof Error ? err as AuthError : new Error('An unknown error occurred') as AuthError 
    }
  }
}

/**
 * Sign out the current user and clean up
 * @returns Object containing error if any
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    // Sign out from Supabase first
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear any stored auth data from localStorage
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('supabase.auth.') || key.includes('supabase.auth.token')) {
        localStorage.removeItem(key)
      }
    }

    // Clear any other app-specific stored data
    localStorage.removeItem('rememberedEmail')
    sessionStorage.clear()

    // Redirect to login page
    window.location.href = '/login'
    
    return { error: null }
  } catch (err) {
    console.error('Error signing out:', err)
    return {
      error: err instanceof Error ? err : new Error('An error occurred during sign out'),
    }
  }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { error: null }
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error('An error occurred during password reset'),
    }
  }
} 