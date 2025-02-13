import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function FollowTest() {
  const { user } = useAuth()
  const [targetUserId, setTargetUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (!user || !targetUserId) return
    setIsLoading(true)
    try {
      // Insert follow relationship
      const { error } = await supabase
        .from('followers')
        .insert([
          { follower_id: user.id, following_id: targetUserId }
        ])

      if (error) throw error
      toast.success('Successfully followed user')
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!user || !targetUserId) return
    setIsLoading(true)
    try {
      // Delete follow relationship
      const { error } = await supabase
        .from('followers')
        .delete()
        .match({ follower_id: user.id, following_id: targetUserId })

      if (error) throw error
      toast.success('Successfully unfollowed user')
    } catch (error) {
      console.error('Error unfollowing user:', error)
      toast.error('Failed to unfollow user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Follow/Unfollow Test</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target User ID
          </label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Enter user ID to follow/unfollow"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleFollow}
            disabled={isLoading || !targetUserId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Follow
          </button>
          <button
            onClick={handleUnfollow}
            disabled={isLoading || !targetUserId}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>
  )
} 