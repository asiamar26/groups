import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'

function generateSimpleUsername(firstName: string, lastName: string): string {
  // Clean and prepare the names
  const fn = firstName.toLowerCase().trim()
  const ln = lastName.toLowerCase().trim()

  // Remove special characters and spaces
  const cleanFirstName = fn.replace(/[^a-z0-9]/g, '')
  const cleanLastName = ln.replace(/[^a-z0-9]/g, '')

  // Generate a random number between 100 and 999
  const randomNum = Math.floor(Math.random() * 900 + 100)

  // Combine first name, last name and random number
  return `${cleanFirstName}${cleanLastName}${randomNum}`
}

export function useAutoUsername(firstName: string, lastName: string) {
  const [username, setUsername] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateAndSetUsername = async () => {
      // Only generate if we have both names
      if (!firstName.trim() || !lastName.trim()) {
        setUsername('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Generate a simple username with random numbers
        const newUsername = generateSimpleUsername(firstName, lastName)
        setUsername(newUsername)
      } catch (err) {
        setError('Failed to generate username')
        console.error('Error generating username:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Generate immediately without debounce
    generateAndSetUsername()
  }, [firstName, lastName])

  return { username, isLoading, error }
} 