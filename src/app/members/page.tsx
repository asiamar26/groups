'use client'

import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import MemberCard from '@/components/members/MemberCard'
import { supabase } from '@/lib/supabase/config'
import type { Profile } from '@/utils/profile'

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [workFilter, setWorkFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [educationFilter, setEducationFilter] = useState('')
  const [members, setMembers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
    const subscription = subscribeToProfileChanges()
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const subscribeToProfileChanges = () => {
    return supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMembers(prev => prev.map(member => 
              member.id === payload.new.id 
                ? { ...member, ...payload.new }
                : member
            ))
          }
        }
      )
      .subscribe()
  }

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const searchString = `${member.first_name} ${member.last_name} ${member.position} ${member.company || ''}`
      .toLowerCase()
    const locationString = `${member.city || ''} ${member.state || ''} ${member.country || ''}`
      .toLowerCase()
    const educationString = member.education
      ?.map(edu => `${edu.degree} ${edu.field} ${edu.school}`)
      .join(' ')
      .toLowerCase() || ''

    return (
      (!searchQuery || searchString.includes(searchQuery.toLowerCase())) &&
      (!workFilter || member.company?.toLowerCase().includes(workFilter.toLowerCase())) &&
      (!locationFilter || locationString.includes(locationFilter.toLowerCase())) &&
      (!educationFilter || educationString.includes(educationFilter.toLowerCase()))
    )
  })

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Join communities that match your professional interests</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Work Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={workFilter}
              onChange={(e) => setWorkFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Education Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div key={member.id} className="h-[200px]">
                <MemberCard member={member} />
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No members found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 