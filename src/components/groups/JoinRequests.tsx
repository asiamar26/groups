import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type GroupMember,
  updateMemberStatus,
  getGroupJoinRequests,
  getGroup,
  type GroupMemberStatus
} from '@/utils/groups'
import { createNotification } from '@/utils/notifications'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface JoinRequestsProps {
  groupId: string
  onUpdate?: () => void
}

interface GroupMemberWithProfile extends GroupMember {
  user: {
    email: string
    display_name: string | null
    avatar_url: string | null
  }
}

export function JoinRequests({ groupId, onUpdate }: JoinRequestsProps) {
  const [requests, setRequests] = useState<GroupMemberWithProfile[]>([])
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [groupId])

  async function loadRequests() {
    try {
      setIsLoading(true)
      const data = await getGroupJoinRequests(groupId)
      setRequests(data as GroupMemberWithProfile[])
    } catch (error) {
      console.error('Error loading join requests:', error)
      toast.error('Failed to load join requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (userId: string, status: GroupMemberStatus) => {
    if (processingIds.has(userId)) return

    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      const { error } = await updateMemberStatus(groupId, userId, status)
      if (error) throw error

      // Get group details for the notification
      const { data: group } = await getGroup(groupId)
      if (!group) throw new Error('Group not found')

      // Create notification
      await createNotification({
        userId,
        type: status === 'active' ? 'group_join_approved' : 'group_join_rejected',
        title: status === 'active' ? 'Join Request Approved' : 'Join Request Rejected',
        message: status === 'active'
          ? `Your request to join ${group.name} has been approved`
          : `Your request to join ${group.name} has been rejected`,
        groupId
      })

      await loadRequests()
      onUpdate?.()
      toast.success(status === 'active' 
        ? 'Member approved successfully' 
        : 'Request rejected successfully'
      )
    } catch (error) {
      console.error('Error updating member status:', error)
      toast.error('Failed to update member status')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading join requests...</div>
  }

  if (requests.length === 0) {
    return <div className="p-4 text-muted-foreground">No pending join requests</div>
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-card"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {request.user.avatar_url ? (
                <AvatarImage src={request.user.avatar_url} alt={request.user.email} />
              ) : (
                <AvatarFallback>
                  {request.user.email[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{request.user.email}</p>
              <p className="text-sm text-muted-foreground">
                Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus(request.user_id, 'none')}
              disabled={processingIds.has(request.user_id)}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleUpdateStatus(request.user_id, 'active')}
              disabled={processingIds.has(request.user_id)}
            >
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 