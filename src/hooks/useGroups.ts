import { useState, useEffect } from 'react'
import { GroupWithMemberInfo } from '@/utils/groups'

export function useGroups() {
  const [groups, setGroups] = useState<GroupWithMemberInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // TODO: Implement group fetching logic here
        // For now, return empty array
        setGroups([])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch groups'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  return { groups, isLoading, error }
} 