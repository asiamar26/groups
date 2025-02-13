import React from 'react'
import Link from 'next/link'
import { MapPin, Building2, GraduationCap, Briefcase, Users, Mail } from 'lucide-react'
import type { Profile } from '@/utils/profile'
import { useAuth } from '@/contexts/AuthContext'
import FollowButton from './FollowButton'

interface MemberCardProps {
  member: Profile
}

export default function MemberCard({ member }: MemberCardProps) {
  const { user } = useAuth()
  const fullName = `${member.first_name} ${member.last_name}`.trim()
  const location = [member.city, member.state, member.country].filter(Boolean).join(', ')

  // Get the latest education if available
  const latestEducation = member.education?.[0]
  
  // Get years of experience if available
  const yearsOfExperience = member.work_experience?.length 
    ? `${member.work_experience.length}+ years experience`
    : null

  return (
    <div className="bg-white rounded-lg shadow w-full h-[200px] flex flex-col">
      {/* Main Content Area - Fixed Height */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Top Section with Avatar, Info, and Follow Button */}
        <div className="flex items-start space-x-4">
          {/* Left Column: Avatar */}
          <div className="flex-shrink-0 w-12">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 text-lg font-semibold">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <Link 
                href={`/profile/${member.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 block truncate"
              >
                {fullName}
              </Link>
              {/* Follow Button */}
              {user?.id !== member.id && (
                <div className="flex-shrink-0">
                  <FollowButton targetUserId={member.id} />
                </div>
              )}
            </div>
            
            {/* Title and Experience */}
            <div className="mb-2">
              <p className="text-sm text-gray-600 truncate font-medium">
                {member.position || 'Member'}
                {yearsOfExperience && (
                  <span className="text-gray-500 ml-2 text-xs">
                    • {yearsOfExperience}
                  </span>
                )}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {member.company && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{member.company}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {latestEducation && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {latestEducation.degree} in {latestEducation.field}
                  </span>
                </div>
              )}
              {member.email && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Fixed Height */}
      <div className="h-[48px] px-4 py-2 border-t flex items-center justify-start gap-6 bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <span className="font-medium text-gray-900">{member.followers_count || 0}</span>
            <span className="text-gray-500 ml-1">followers</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">{member.following_count || 0}</span>
          <span className="text-gray-500 ml-1">following</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">{member.groups_count || 0}</span>
          <span className="text-gray-500 ml-1">groups</span>
        </div>
      </div>
    </div>
  )
} 