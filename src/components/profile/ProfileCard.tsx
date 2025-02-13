'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { useProfile } from '@/hooks/useProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/Button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  getColorClass, 
  getFontSizeClass, 
  getFontWeightClass,
  getBorderRadiusClass
} from '@/lib/utils'
import { MapPin, Briefcase, Link as LinkIcon } from 'lucide-react'

interface ProfileCardProps {
  userId: string
  variant?: 'default' | 'compact'
}

export function ProfileCard({ userId, variant = 'default' }: ProfileCardProps) {
  const { profile, isLoading, error } = useProfile(userId)

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className={getColorClass('error')}>Failed to load profile</p>
          <Button variant="ghost" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <p className={getColorClass('secondary')}>Profile not found</p>
      </Card>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <Card className="overflow-hidden">
      {variant === 'default' && profile.cover_image && (
        <div className="h-32 w-full">
          <img
            src={profile.cover_image}
            alt="Profile cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className={variant === 'default' ? 'h-20 w-20' : 'h-12 w-12'}>
            <AvatarImage src={profile.avatar_url || undefined} alt={fullName} />
            <AvatarFallback className={getBorderRadiusClass('full')}>
              {fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`${getFontSizeClass('xl')} ${getFontWeightClass('semibold')} truncate`}>
                  {fullName}
                </h3>
                {profile.username && (
                  <p className={`${getColorClass('secondary')} truncate`}>
                    @{profile.username}
                  </p>
                )}
              </div>
            </div>

            {variant === 'default' && (
              <>
                {profile.about && (
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    {profile.about}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {profile.position && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.position}</span>
                      {profile.company && (
                        <span>at {profile.company}</span>
                      )}
                    </div>
                  )}

                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[profile.city, profile.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <LinkIcon className="h-4 w-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${getColorClass('primary')} hover:underline`}
                      >
                        {new URL(profile.website).hostname}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div>
                    <span className={getFontWeightClass('semibold')}>
                      {profile.followers_count}
                    </span>{' '}
                    <span className={getColorClass('secondary')}>followers</span>
                  </div>
                  <div>
                    <span className={getFontWeightClass('semibold')}>
                      {profile.following_count}
                    </span>{' '}
                    <span className={getColorClass('secondary')}>following</span>
                  </div>
                  <div>
                    <span className={getFontWeightClass('semibold')}>
                      {profile.groups_count}
                    </span>{' '}
                    <span className={getColorClass('secondary')}>groups</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
} 