'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Building2, Globe, Mail } from 'lucide-react'
import { getProfile, getProfileCounts, followUser, unfollowUser, isFollowing, type Profile } from '@/utils/profile'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase/config'

export default function MemberProfilePage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFollowed, setIsFollowed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadProfile()
      const subscriptions = subscribeToChanges()
      return () => {
        subscriptions.forEach(subscription => {
          if (subscription) {
            subscription.unsubscribe()
          }
        })
      }
    }
  }, [id])

  useEffect(() => {
    if (user && profile) {
      checkFollowStatus()
    }
  }, [user, profile?.id])

  const subscribeToChanges = () => {
    if (!id) return []
    console.log('Setting up subscriptions for profile:', id)

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel(`profile-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${id}`
        },
        async (payload) => {
          console.log('Profile updated:', payload)
          await loadProfile()
        }
      )
      .subscribe()

    // Subscribe to follower changes
    const followerSubscription = supabase
      .channel(`follower-changes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${id}`
        },
        async () => {
          console.log('Follower changes detected for:', id)
          await loadProfile()
          if (user) {
            await checkFollowStatus()
          }
        }
      )
      .subscribe()

    // Subscribe to following changes (for the current user)
    const followingSubscription = user ? supabase
      .channel(`following-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${user.id}`
        },
        async () => {
          console.log('Following changes detected for current user')
          await loadProfile()
          await checkFollowStatus()
        }
      )
      .subscribe()
    : null

    return [profileSubscription, followerSubscription, followingSubscription].filter(Boolean)
  }

  const loadProfile = async () => {
    if (!id) return
    try {
      const [profileResult, countsResult] = await Promise.all([
        getProfile(id),
        getProfileCounts(id)
      ])

      if (profileResult.data) {
        setProfile({
          ...profileResult.data,
          followers_count: countsResult.followers,
          following_count: countsResult.following,
          groups_count: countsResult.groups
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const checkFollowStatus = async () => {
    if (!user || !profile || !profile.id) return
    try {
      const following = await isFollowing(user.id, profile.id)
      setIsFollowed(following)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please sign in to follow members')
      return
    }

    if (!profile || !profile.id) return

    if (user.id === profile.id) {
      toast.error('You cannot follow yourself')
      return
    }

    setIsLoading(true)
    try {
      if (isFollowed) {
        const { error } = await unfollowUser(user.id, profile.id)
        if (error) throw error
        toast.success(`Unfollowed ${profile.first_name} ${profile.last_name}`)
      } else {
        const { error } = await followUser(user.id, profile.id)
        if (error) throw error
        toast.success(`Following ${profile.first_name} ${profile.last_name}`)
      }
      
      // Update local state
      setIsFollowed(!isFollowed)
      
      // Refresh data immediately
      await Promise.all([
        loadProfile(),
        checkFollowStatus()
      ])
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-semibold">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-lg text-gray-600 mt-1">{profile.position}</p>
              
              <div className="mt-4 flex flex-wrap gap-4">
                {location && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-5 w-5" />
                    <span>{location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="h-5 w-5" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Globe className="h-5 w-5" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {new URL(profile.website).hostname}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${profile.email}`} className="hover:text-blue-600">
                    {profile.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{profile.following_count}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{profile.followers_count}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{profile.groups_count}</div>
                <div className="text-sm text-gray-500">Groups</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {profile.about && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{profile.about}</p>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <h3 className="font-medium text-gray-900">{edu.school}</h3>
                      <p className="text-gray-600">{edu.degree} in {edu.field}</p>
                      {edu.year && <p className="text-sm text-gray-500">Class of {edu.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.company}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 