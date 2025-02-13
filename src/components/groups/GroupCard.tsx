import { useState } from 'react'
import Link from 'next/link'
import { Users, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { joinGroup, leaveGroup, type GroupWithMemberInfo } from '@/utils/groups'
import { useToast } from '@/components/ui/use-toast'

interface GroupCardProps {
  group: GroupWithMemberInfo
  onUpdate?: () => void
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleJoinGroup = async () => {
    try {
      setIsLoading(true)
      const { error } = await joinGroup(group.id)
      if (error) throw error
      
      toast({
        title: "Success",
        description: "You have joined the group successfully",
      })
      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    try {
      setIsLoading(true)
      const { error } = await leaveGroup(group.id)
      if (error) throw error
      
      toast({
        title: "Success",
        description: "You have left the group",
      })
      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canViewDetails = group.privacy === 'public' || group.currentUserStatus === 'active'

  return (
    <Card className="group-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Link href={`/groups/${group.id}`} className="text-link hover:no-underline">
            <CardTitle className="text-heading flex items-center gap-2">
              {group.name}
              {group.privacy === 'private' ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
          </Link>
          <Badge variant={group.privacy === 'private' ? 'outline' : 'default'}>
            {group.privacy}
          </Badge>
        </div>
        <CardDescription className="text-muted">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(canViewDetails || group.privacy === 'public') && group.categories && group.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {group.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-muted-foreground">
                {category}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-muted">
          <Users className="w-4 h-4" />
          <span>{group.members?.length || 0} members</span>
        </div>
      </CardContent>
      <CardFooter>
        {group.currentUserStatus === 'none' ? (
          <Button
            onClick={handleJoinGroup}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            Join Group
          </Button>
        ) : group.currentUserStatus === 'active' ? (
          <Button
            variant="outline"
            onClick={handleLeaveGroup}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            Leave Group
          </Button>
        ) : (
          <Button disabled className="w-full">
            Pending Approval
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 