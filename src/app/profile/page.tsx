'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Edit2, Mail, MapPin, Building2, Globe, 
  Image, FileText, Smile, Users, 
  Twitter, Github, Linkedin, Hash, Globe2, Camera, Edit, Pencil
} from 'lucide-react'
import EditProfileForm from '@/components/profile/EditProfileForm'
import { getProfile, updateProfile, createProfile, getProfileCounts, getProfileStats, subscribeToProfileStats } from '@/utils/profile'
import type { Profile, ProfileUpdateInput } from '@/types/profile'
import { toast } from 'react-hot-toast'
import { uploadProfilePicture, deleteProfilePicture } from '@/utils/storage'
import ImageCropModal from '@/components/profile/ImageCropModal'
import { validateImage } from '@/utils/fileValidation'
import type { ImageState } from '@/components/profile/ImageCropModal'
import { supabase } from '@/lib/supabase/config'
import FollowTest from '@/components/profile/FollowTest'
import ImageNext from 'next/image'
import Link from 'next/link'

interface ProfileStats {
  followingCount: number
  followersCount: number
  groupsCount: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [lastImageState, setLastImageState] = useState<ImageState | null>(null)
  const [stats, setStats] = useState<ProfileStats>({
    followingCount: 0,
    followersCount: 0,
    groupsCount: 0
  })

  useEffect(() => {
    if (user) {
      loadProfile()
      // Subscribe to real-time updates for stats
      const unsubscribe = subscribeToProfileStats(user.id, (newStats) => {
        setStats(newStats)
      })
      return () => {
        unsubscribe()
      }
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Get profile data
      const { data: existingProfile, error: profileError } = await getProfile(user.id)

      if (!existingProfile && !profileError) {
        // Create a new profile if one doesn't exist
        const { data: newProfile } = await createProfile(user.id, {
          first_name: '',
          last_name: '',
          email: user.email || '',
          position: 'Member'
        })

        if (newProfile) {
          // Get fresh profile data with counts
          const { data: freshProfile } = await getProfile(user.id)
          if (freshProfile) {
            setProfile(freshProfile)
          } else {
            toast.error('Failed to load profile data')
          }
        } else {
          toast.error('Failed to create profile')
        }
      } else if (existingProfile) {
        // Get fresh profile data with counts
        const { data: freshProfile } = await getProfile(user.id)
        if (freshProfile) {
          setProfile(freshProfile)
        } else {
          toast.error('Failed to load profile data')
        }
      } else {
        toast.error('Failed to load profile')
      }

      // Load stats
      const stats = await getProfileStats(user.id)
      setStats(stats)

    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Subscribe to follower changes
  const subscribeToFollowerChanges = () => {
    if (!user) return

    console.log('Subscribing to follower changes for user:', user.id)

    // Subscribe to followers table changes for both follower and following
    return supabase
      .channel('follower-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${user.id} OR following_id=eq.${user.id}`
        },
        async () => {
          // Update profile with new counts
          const { data: updatedProfile } = await getProfile(user.id)
          if (updatedProfile) {
            setProfile(updatedProfile)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          // Update profile with new counts when group membership changes
          const { data: updatedProfile } = await getProfile(user.id)
          if (updatedProfile) {
            setProfile(updatedProfile)
          }
        }
      )
      .subscribe()
  }

  const handleProfileUpdate = async (updates: ProfileUpdateInput) => {
    if (!user) return
    try {
      // First update the profile
      const { error } = await updateProfile(user.id, updates)
      if (error) throw error

      // Then reload the profile to get the latest data with counts
      await loadProfile()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate the file
      const validation = await validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      // Create URL for cropping
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowCropModal(true);
    } catch (error) {
      console.error('Error handling profile picture:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const handleEditProfilePicture = () => {
    if (!profile?.avatar_url) return;
    setSelectedImage(profile.avatar_url);
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedImage: Blob, imageState?: ImageState) => {
    if (!user) return;

    try {
      setIsUploading(true);
      
      // Create a File from the Blob
      const imageFile = new File([croppedImage], 'profile-picture.jpg', { type: 'image/jpeg' });
      
      // Upload new profile picture
      const publicUrl = await uploadProfilePicture(user.id, imageFile);

      // Only delete the old profile picture if it's different from the current one
      if (profile?.avatar_url && profile.avatar_url !== publicUrl) {
        await deleteProfilePicture(user.id, profile.avatar_url);
      }

      // Update profile with new avatar URL
      const updatedProfile = await updateProfile(user.id, {
        avatar_url: publicUrl
      });

      setProfile(updatedProfile);
      setLastImageState(imageState || null);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
      setShowCropModal(false);
      if (selectedImage && selectedImage !== profile?.avatar_url) {
        URL.revokeObjectURL(selectedImage);
      }
      setSelectedImage(null);
    }
  };

  // Stats display section
  const renderStats = () => {
    console.log('Rendering stats with profile:', profile)
    return (
      <div className="grid grid-cols-3 border-t border-gray-200">
        <Link href="/following" className="text-center py-4 hover:bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">{stats.followingCount}</div>
          <div className="text-sm text-gray-500">Following</div>
        </Link>
        <Link href="/followers" className="text-center py-4 border-x border-gray-200 hover:bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">{stats.followersCount}</div>
          <div className="text-sm text-gray-500">Followers</div>
        </Link>
        <Link href="/groups" className="text-center py-4 hover:bg-gray-50">
          <div className="text-2xl font-bold text-gray-900">{stats.groupsCount}</div>
          <div className="text-sm text-gray-500">Groups</div>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Profile content */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
            
            {/* Profile Picture */}
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
                  {profile?.avatar_url ? (
                    <ImageNext
                      src={profile.avatar_url}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {user?.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEditProfilePicture}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6 pt-16">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </h1>
            <p className="text-gray-500">{profile?.position || 'No position set'}</p>

            {/* Profile Details */}
            <div className="mt-6 space-y-4">
              {profile?.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.organization && (
                <div className="flex items-center text-gray-600">
                  <Building2 className="h-5 w-5 mr-2" />
                  <span>{profile.organization}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="h-5 w-5 mr-2" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(profile?.twitter_username || profile?.github_username || profile?.linkedin_username) && (
              <div className="mt-6 flex space-x-4">
                {profile?.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile?.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-900"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile?.linkedin_username && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-700"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}

            {/* Stats */}
            {renderStats()}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && profile && (
        <EditProfileForm
          profile={profile}
          onSubmit={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Image Crop Modal */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          imageUrl={selectedImage}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false)
            if (selectedImage !== profile?.avatar_url) {
              URL.revokeObjectURL(selectedImage)
            }
            setSelectedImage(null)
          }}
          initialState={lastImageState}
        />
      )}

      {/* Hidden file input for profile picture upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePictureChange}
        className="hidden"
        id="profile-picture-input"
      />
    </div>
  )
} 