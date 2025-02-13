'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createGroup, GroupPrivacy } from '@/utils/groups'
import { supabase } from '@/lib/supabase'
import { 
  Globe, 
  Lock, 
  Users,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const privacyOptions = [
  {
    id: 'public' as GroupPrivacy,
    title: 'Public',
    description: 'Anyone can see and join the group',
    icon: Globe
  },
  {
    id: 'private' as GroupPrivacy,
    title: 'Private',
    description: 'Only members can see content, approval required to join',
    icon: Lock
  },
  {
    id: 'invite' as GroupPrivacy,
    title: 'Invite Only',
    description: 'Hidden group, members must be invited',
    icon: Users
  }
]

const categoryOptions = [
  // Professional & Work
  { id: 'professional_networking', label: 'Professional Networking' },
  { id: 'work_team', label: 'Work Team' },
  { id: 'career_development', label: 'Career Development' },
  { id: 'job_opportunities', label: 'Job Opportunities' },
  
  // Education & Learning
  { id: 'study_group', label: 'Study Group' },
  { id: 'school_class', label: 'School Class' },
  { id: 'alumni', label: 'Alumni' },
  { id: 'research', label: 'Research' },
  { id: 'skill_development', label: 'Skill Development' },
  
  // Community & Social
  { id: 'local_community', label: 'Local Community' },
  { id: 'neighborhood', label: 'Neighborhood' },
  { id: 'events_meetups', label: 'Events & Meetups' },
  { id: 'sports_recreation', label: 'Sports & Recreation' },
  
  // Interest & Hobbies
  { id: 'gaming', label: 'Gaming' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'arts_culture', label: 'Arts & Culture' },
  { id: 'food_cooking', label: 'Food & Cooking' },
  { id: 'travel', label: 'Travel' },
  
  // Support & Help
  { id: 'support_group', label: 'Support Group' },
  { id: 'mental_health', label: 'Mental Health' },
  { id: 'parenting', label: 'Parenting' },
  { id: 'health_wellness', label: 'Health & Wellness' },
  
  // Business & Commerce
  { id: 'buy_sell', label: 'Buy & Sell' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'small_business', label: 'Small Business' },
  { id: 'startups', label: 'Startups' },
  
  // Technology
  { id: 'tech_general', label: 'Technology - General' },
  { id: 'programming', label: 'Programming' },
  { id: 'digital_creation', label: 'Digital Creation' },
  { id: 'crypto_blockchain', label: 'Crypto & Blockchain' },
  
  // Other
  { id: 'other', label: 'Other' }
]

export default function NewGroupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    privacy: GroupPrivacy;
    categories: string[];
  }>({
    name: '',
    description: '',
    privacy: 'public',
    categories: []
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      if (!user) return null;
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('group-covers')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('group-covers')
        .getPublicUrl(`public/${fileName}`)

      return publicUrl
    } catch (error) {
      console.error('Error uploading cover image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('Please sign in to create a group')
      return
    }

    // Validate that at least one category is selected
    if (formData.categories.length === 0) {
      toast.error('Please select at least one category')
      return
    }

    try {
      setIsLoading(true)
      let coverImageUrl = null

      // Handle image upload if exists
      if (coverImage) {
        coverImageUrl = await uploadCoverImage(coverImage)
        if (!coverImageUrl) {
          toast.error('Failed to upload cover image')
          return
        }
      }

      const groupData = {
        ...formData,
        created_by: user.id,
        cover_image: coverImageUrl
      }

      const { data: group, error } = await createGroup(groupData)
      
      if (error) throw error
      if (!group) throw new Error('Failed to create group')

      toast.success('Group created successfully!')
      router.push(`/groups/${group.id}`)
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create group. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
      
      // No longer forcing 'general' as a default
      return {
        ...prev,
        categories
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Group</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a group to bring people together and build a community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Cover Image
          </label>
          <div className="relative">
            <div className="aspect-[3/1] rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload a cover image
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Group Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Group Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacy Settings
          </label>
          <div className="space-y-3">
            {privacyOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-start p-3 border rounded-lg cursor-pointer hover:border-blue-500 ${
                  formData.privacy === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={option.id}
                  checked={formData.privacy === option.id}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.value as GroupPrivacy })}
                  className="sr-only"
                />
                <option.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{option.title}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories (Select up to 3)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categoryOptions.map((category) => (
              <label
                key={category.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer hover:border-blue-500 ${
                  formData.categories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } ${
                  formData.categories.length > 2 && !formData.categories.includes(category.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  disabled={formData.categories.length > 2 && !formData.categories.includes(category.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-900">{category.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Choose up to 3 categories that best describe your group
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Creating Group...
            </>
          ) : (
            'Create Group'
          )}
        </button>
      </form>
    </div>
  )
} 