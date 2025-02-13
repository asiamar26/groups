'use client'

import { useState, type ChangeEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users } from "lucide-react"
import { inviteToGroup } from "@/utils/groups"
import { supabase } from "@/lib/supabase/config"
import { toast } from "sonner"

interface InviteMembersDialogProps {
  groupId: string
  trigger: React.ReactNode
}

interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
}

export function InviteMembersDialog({ groupId, trigger }: InviteMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [invitingIds, setInvitingIds] = useState<Set<string>>(new Set())

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .or(`email.ilike.%${query}%, display_name.ilike.%${query}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    }
  }

  const handleInvite = async (userId: string) => {
    if (invitingIds.has(userId)) return

    setInvitingIds(prev => new Set(prev).add(userId))
    try {
      const { error } = await inviteToGroup(groupId, userId)
      
      if (error) {
        if (error.message === 'You must be logged in to invite members') {
          toast.error('Please log in to invite members')
          return
        }
        throw error
      }
      
      toast.success('Invitation sent successfully')
      
      // Remove the invited user from results
      setSearchResults(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error inviting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setInvitingIds(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite New Members</DialogTitle>
          <DialogDescription>
            Search and invite new members to join your group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        {(user.display_name?.[0] || user.email[0]).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.display_name || user.email}
                    </p>
                    {user.display_name && (
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleInvite(user.id)}
                  disabled={invitingIds.has(user.id)}
                >
                  {invitingIds.has(user.id) ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your search.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 