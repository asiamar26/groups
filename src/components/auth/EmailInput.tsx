'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/config'

interface EmailInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  className?: string
}

export default function EmailInput({ value, onChange, className = '' }: EmailInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const checkEmail = async (email: string) => {
    // Basic validation first
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      setIsValid(false)
      onChange(email, false)
      return
    }

    setIsChecking(true)
    console.log('Checking email:', email)

    try {
      const { data, error } = await supabase
        .rpc('check_email_exists', {
          email_to_check: email.toLowerCase()
        })

      if (error) throw error

      const exists = data?.exists || false

      if (exists) {
        setError('This email is already registered')
        setIsValid(false)
      } else {
        setError(null)
        setIsValid(true)
      }
    } catch (err) {
      console.error('Error checking email:', err)
      setError('Unable to verify email')
      setIsValid(false)
    } finally {
      setIsChecking(false)
    }

    onChange(email, isValid)
  }

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    console.log('Email changed:', newEmail)
    onChange(newEmail, false)
    
    // Only check if we have a complete email
    if (newEmail.includes('@')) {
      setIsChecking(true)
      // Add a small delay before checking
      setTimeout(() => {
        checkEmail(newEmail)
      }, 500)
    } else {
      setError(null)
      setIsValid(false)
    }
  }

  return (
    <div className="w-full">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <div className="mt-1 relative">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={value}
          onChange={handleEmailChange}
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
            placeholder-gray-400 focus:outline-none focus:ring-blue-500 
            focus:border-blue-500 sm:text-sm ${className}
            ${error ? 'border-red-300' : isValid ? 'border-green-300' : 'border-gray-300'}
          `}
          placeholder="you@example.com"
        />
        <div className="absolute right-2 top-2">
          {isChecking ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : isValid ? (
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : error ? (
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : null}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 
