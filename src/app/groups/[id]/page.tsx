'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Users, Calendar, Lock, Globe, ArrowLeft, MessageSquare, Calendar as CalendarIcon, Settings, FileText, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getGroupDetails,
  joinGroup,
  leaveGroup,
  type GroupWithMemberInfo,
} from '@/utils/groups'
import { toast } from 'sonner'
import { JoinRequests } from '@/components/groups/JoinRequests'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Discussion } from '@/components/groups/Discussion'
import { Events } from '@/components/groups/Events'
import { GroupDetails } from '@/components/groups/GroupDetails'
import { EditGroupDialog } from '@/components/groups/EditGroupDialog'
import { InviteMembersDialog } from '@/components/groups/InviteMembersDialog'

export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupWithMemberInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    loadGroup()
  }, [params.id])

  async function loadGroup() {
    try {
      setIsLoading(true)
      const { data, error } = await getGroupDetails(params.id)
      if (error) throw error
      if (data) {
        setGroup(data as GroupWithMemberInfo)
      }
    } catch (error) {
      console.error('Error loading group:', error)
      toast.error('Failed to load group details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!group) return
    try {
      setIsActionLoading(true)
      const { error } = await joinGroup(group.id)
      if (error) throw error
      
      toast.success(group.privacy === 'private' 
        ? 'Join request sent! Waiting for admin approval.' 
        : 'Successfully joined the group!')
      loadGroup()
    } catch (error) {
      console.error('Error joining group:', error)
      toast.error('Failed to join group')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!group) return
    try {
      setIsActionLoading(true)
      const { error } = await leaveGroup(group.id)
      if (error) throw error
      
      toast.success('Left group successfully')
      loadGroup()
    } catch (error) {
      console.error('Error leaving group:', error)
      toast.error('Failed to leave group')
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return <GroupDetailsSkeleton />
  }

  if (!group) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Group not found</h1>
          <p className="text-muted-foreground mb-8">
            The group you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    )
  }

  const canViewDetails = group.privacy === 'public' || group.currentUserStatus === 'active'

  if (!canViewDetails) {
    return (
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => router.push('/groups')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <Badge variant="outline" className="gap-1">
                <Lock className="w-3 h-3" />
                Private Group
              </Badge>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">About This Private Group</h2>
              <p className="text-muted-foreground">
                This is a private group. To view its contents and participate in discussions,
                you need to be a member. You can request to join, and the group administrators
                will review your request.
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} members</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {group.currentUserStatus === 'pending' ? (
              <div className="bg-muted rounded-lg p-4 text-center">
                <h3 className="font-medium mb-2">Join Request Pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your request to join this group is being reviewed by the administrators.
                  We'll notify you when they make a decision.
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-4 text-center">
                <h3 className="font-medium mb-2">Want to Join This Group?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Request to join this private group to access its content and connect with other members.
                </p>
                <Button
                  className="w-full"
                  onClick={handleJoinGroup}
                  disabled={isActionLoading}
                >
                  Request to Join
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-8">
      <Button
        variant="ghost"
        className="mb-4 sm:mb-8 -ml-2"
        onClick={() => router.push('/groups')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Groups
      </Button>

      {/* Mobile Quick Actions - Show at top on mobile, hide on desktop */}
      {group.currentUserStatus === 'active' && (
        <div className="lg:hidden mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 -mx-1">
            <Button variant="outline" size="sm" className="flex-none">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
            <Button variant="outline" size="sm" className="flex-none">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
            <InviteMembersDialog
              groupId={group.id}
              trigger={
                <Button variant="outline" size="sm" className="flex-none">
                  <Users className="w-4 h-4 mr-2" />
                  Invite New Members
                </Button>
              }
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[2fr,1fr]">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                {group.name}
                {group.privacy === 'private' && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground mt-1">
                <span>{group.members?.length || 0} members</span>
                <span>Active {formatDistanceToNow(new Date(group.last_activity_at), { addSuffix: true })}</span>
                <span>{group.categories?.join(', ')}</span>
              </div>
            </div>
            {group.currentUserRole === 'admin' && (
              <EditGroupDialog
                group={group}
                onSuccess={loadGroup}
                trigger={
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Group
                  </Button>
                }
              />
            )}
          </div>

          <div>
            <Tabs defaultValue="discussions" className="w-full">
              <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                <TabsTrigger value="discussions" className="gap-2 flex-none">
                  <MessageSquare className="w-4 h-4 hidden sm:block" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="about" className="gap-2 flex-none">
                  <FileText className="w-4 h-4 hidden sm:block" />
                  About
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 flex-none">
                  <CalendarIcon className="w-4 h-4 hidden sm:block" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2 flex-none">
                  <Users className="w-4 h-4 hidden sm:block" />
                  Members
                </TabsTrigger>
                {group.currentUserRole === 'admin' && (
                  <TabsTrigger value="settings" className="gap-2 flex-none">
                    <Settings className="w-4 h-4 hidden sm:block" />
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="discussions">
                <Discussion groupId={group.id} />
              </TabsContent>

              <TabsContent value="about" className="space-y-4 sm:space-y-6">
                <div className="prose max-w-none">
                  <p className="text-base sm:text-lg">{group.description}</p>
                  {group.categories && group.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {group.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="events">
                <Events groupId={group.id} />
              </TabsContent>

              <TabsContent value="members">
                <div className="space-y-4 sm:space-y-6">
                  {group.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {member.avatar_url && (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name || member.email}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                          />
                        )}
                        {!member.avatar_url && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm sm:text-base">{member.display_name || member.email}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      {group.currentUserRole === 'admin' && member.id !== group.currentUserId && (
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {group.currentUserRole === 'admin' && (
                <TabsContent value="settings">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Group Settings</h3>
                      <p className="text-muted-foreground">
                        Manage your group's settings and preferences
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Group Details
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        Notification Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                        Delete Group
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Desktop Quick Actions - Hide on mobile */}
        <div className="hidden lg:block space-y-6">
          {group.currentUserStatus === 'active' ? (
            <>
              {group.currentUserRole === 'admin' && (
                <JoinRequests 
                  groupId={group.id} 
                  onUpdate={loadGroup}
                />
              )}
              <div className="bg-card rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Quick Actions</h3>
                <div className="grid gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    New Discussion
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule Event
                  </Button>
                  <InviteMembersDialog
                    groupId={group.id}
                    trigger={
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Invite New Members
                      </Button>
                    }
                  />
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLeaveGroup}
                    disabled={isActionLoading}
                  >
                    Leave Group
                  </Button>
                </div>
              </div>
            </>
          ) : group.currentUserStatus === 'pending' ? (
            <Button variant="secondary" className="w-full" disabled>
              Join Request Pending
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleJoinGroup}
              disabled={isActionLoading}
            >
              {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
            </Button>
          )}
        </div>

        {/* Mobile Join/Leave Actions - Show at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
          {group.currentUserStatus === 'active' ? (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleLeaveGroup}
              disabled={isActionLoading}
            >
              Leave Group
            </Button>
          ) : group.currentUserStatus === 'pending' ? (
            <Button variant="secondary" className="w-full" disabled>
              Join Request Pending
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleJoinGroup}
              disabled={isActionLoading}
            >
              {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function GroupDetailsSkeleton() {
  return (
    <div className="container py-8">
      <div className="h-10 w-24 mb-8">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
} 