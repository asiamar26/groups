import { useState, useEffect, useCallback } from 'react'
import { generate } from 'username-generator'
import { supabase } from '@/lib/supabase/config'

export function useUsernameSuggestions(firstName: string, lastName: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSuggestions = useCallback(async () => {
    // Only generate if we have both names
    if (!firstName.trim() || !lastName.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const suggestions: string[] = []
      const fn = firstName.toLowerCase().trim()
      const ln = lastName.toLowerCase().trim()

      // Basic combinations
      const basicSuggestions = [
        // Full name combinations
        `${fn}${ln}`,
        `${fn}.${ln}`,
        `${fn}_${ln}`,
        // First name variations
        `${fn}${Math.floor(Math.random() * 999)}`,
        `${fn}_${Math.floor(Math.random() * 99)}`,
        // Last name variations
        `${ln}${fn}`,
        `${ln}.${fn}`,
        // Initial combinations
        `${fn[0]}${ln}`,
        `${fn}${ln[0]}`,
        `${fn[0]}${ln}${Math.floor(Math.random() * 99)}`,
      ]

      // Add basic suggestions
      suggestions.push(...basicSuggestions)

      // Add some random username suggestions
      for (let i = 0; i < 3; i++) {
        const randomUsername = generate()
        suggestions.push(`${randomUsername}${Math.floor(Math.random() * 99)}`)
      }

      // Batch check availability for all suggestions
      const { data: availabilityData, error } = await supabase
        .rpc('check_usernames_availability', {
          usernames: suggestions
        })

      if (error) throw error

      // Filter available usernames
      const availableUsernames = suggestions.filter(
        (username, index) => availabilityData[index].available
      )

      // Take the first 6 available usernames
      setSuggestions(availableUsernames.slice(0, 6))
    } catch (err) {
      setError('Failed to generate username suggestions')
      console.error('Error generating username suggestions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [firstName, lastName])

  // Debounce the suggestions generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions()
    }, 500) // Wait 500ms after last change before generating

    return () => clearTimeout(timer)
  }, [generateSuggestions])

  // Function to generate new suggestions manually
  const refreshSuggestions = () => {
    generateSuggestions()
  }

  return { suggestions, isLoading, error, refreshSuggestions }
} 