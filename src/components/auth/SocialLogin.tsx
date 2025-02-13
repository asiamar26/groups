'use client'

import React from 'react'
import { supabase } from '@/lib/supabase/config'
import Image from 'next/image'

interface SocialLoginProps {
  onError?: (error: string) => void
  className?: string
}

export default function SocialLogin({ onError, className = '' }: SocialLoginProps) {
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined
        }
      })

      if (error) throw error
    } catch (err) {
      console.error(`${provider} login error:`, err)
      onError?.(err instanceof Error ? err.message : `Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={() => handleSocialLogin('google')}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
      >
        <Image
          src="/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="text-sm text-gray-700">Continue with Google</span>
      </button>

      <button
        type="button"
        onClick={() => handleSocialLogin('apple')}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
      >
        <Image
          src="/apple.svg"
          alt="Apple"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="text-sm text-gray-700">Continue with Apple</span>
      </button>
    </div>
  )
} 