'use client'

import React, { useState, useEffect } from 'react'
import { debounce } from 'lodash'
import { supabase } from '@/lib/supabase/config'
import { Check, X, Loader2 } from 'lucide-react'

interface UsernameSetupProps {
  onSubmit: (username: string) => Promise<void>
  initialValue?: string
  onSkip?: () => void
}

export default function UsernameSetup({ onSubmit, initialValue = '', onSkip }: UsernameSetupProps) {
  const [username, setUsername] = useState(initialValue)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounced function to check username availability
  const checkAvailability = debounce(async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const { data, error } = await supabase
        .from('usernames')
        .select('username')
        .eq('username', value.toLowerCase())
        .single()

      setIsAvailable(!data)
    } catch (error) {
      console.error('Error checking username:', error)
    } finally {
      setIsChecking(false)
    }
  }, 500)

  useEffect(() => {
    if (username) {
      checkAvailability(username)
    } else {
      setIsAvailable(null)
    }
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !isAvailable || isChecking) return

    setIsSubmitting(true)
    try {
      await onSubmit(username.toLowerCase())
    } catch (error) {
      setError('Failed to set username. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose your username</h2>
        <p className="text-gray-600">
          This will be your unique identifier on the platform.
          Choose wisely - you can't change it later!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                setUsername(value)
                setError(null)
              }}
              className={`
                block w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${isAvailable ? 'border-green-500' : 'border-gray-300'}
                ${error ? 'border-red-500' : ''}
              `}
              placeholder="e.g. john_doe"
              pattern="[a-z0-9_]+"
              title="Only lowercase letters, numbers, and underscores allowed"
              minLength={3}
              maxLength={30}
              required
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isChecking && (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              )}
              {!isChecking && isAvailable && (
                <Check className="h-5 w-5 text-green-500" />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          {isAvailable === false && (
            <p className="mt-1 text-sm text-red-600">This username is already taken</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Only lowercase letters, numbers, and underscores allowed
          </p>
        </div>

        <div className="flex gap-4">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isAvailable || isChecking || isSubmitting}
          >
            {isSubmitting ? 'Setting username...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  )
} 