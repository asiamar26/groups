'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { Users, MessageSquare, Bell, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { GroupCard } from '@/components/groups/GroupCard'
import type { GroupWithMemberInfo } from '@/types/groups'

/**
 * Dashboard Page Component
 * Shows user's personalized dashboard with groups, events, and activity
 */
export default function DashboardPage() {
  const { user } = useAuth()
  const [recentGroups, setRecentGroups] = useState<GroupWithMemberInfo[]>([])
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeDiscussions: 0,
    notifications: 0,
    engagement: 0
  })

  useEffect(() => {
    // TODO: Fetch actual data
    setStats({
      totalGroups: 12,
      activeDiscussions: 28,
      notifications: 5,
      engagement: 87
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.first_name || 'User'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening in your groups today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGroups}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Discussions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDiscussions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.notifications}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900">
                <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.engagement}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Items */}
              <div className="flex items-start space-x-4">
                <Avatar className="mt-1">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">John Doe</span> posted in{' '}
                    <span className="font-medium">Design Team</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              {/* Add more activity items here */}
            </div>
          </CardContent>
        </Card>

        {/* Your Groups */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Groups</CardTitle>
            <Link href="/groups/create">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Group
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGroups.length > 0 ? (
                recentGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">No groups yet</p>
                  <Link href="/groups">
                    <Button variant="outline" className="mt-2">
                      Browse Groups
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 