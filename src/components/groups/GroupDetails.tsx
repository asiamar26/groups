'use client'

import { EditGroupDialog } from "./EditGroupDialog"
import { Button } from "@/components/ui/button"
import { Settings, Lock, FileText, MessageSquare, Calendar, Users } from "lucide-react"
import type { GroupWithMemberInfo } from "@/types/groups"
import Link from "next/link"
import { getColorClass, getFontSizeClass, getFontWeightClass } from "@/lib/utils"

interface GroupDetailsProps {
  group: GroupWithMemberInfo
  onGroupUpdated?: () => void
}

export function GroupDetails({ group, onGroupUpdated }: GroupDetailsProps) {
  const canEdit = group.currentUserRole === 'admin'

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/groups" className={`${getColorClass('secondary')} hover:${getColorClass('primary')}`}>
            ← Back to Groups
          </Link>
          {canEdit && (
            <EditGroupDialog
              group={group}
              onSuccess={onGroupUpdated}
              trigger={
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Group
                </Button>
              }
            />
          )}
        </div>

        <div>
          <h1 className={`${getFontSizeClass('2xl')} ${getFontWeightClass('bold')} flex items-center gap-2 ${getColorClass('primary', 800)}`}>
            {group.name}
            {group.privacy === 'private' && (
              <span className={`${getFontSizeClass('sm')} ${getFontWeightClass('normal')} ${getColorClass('secondary')} flex items-center gap-1`}>
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}
          </h1>
          <div className={`flex items-center gap-6 ${getFontSizeClass('sm')} ${getColorClass('secondary')} mt-1`}>
            <span>{group.members.length} members</span>
            <span>Active {new Date(group.last_activity_at).toLocaleDateString()}</span>
            <span>{group.categories?.join(', ')}</span>
          </div>
        </div>

        <div className="border-b">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link 
              href="#" 
              className={`border-primary ${getColorClass('primary')} border-b-2 py-4 px-1 ${getFontSizeClass('sm')} ${getFontWeightClass('medium')} flex items-center gap-2`}
            >
              <FileText className="w-4 h-4" />
              About
            </Link>
            <Link 
              href="#" 
              className={`${getColorClass('secondary')} hover:${getColorClass('primary')} border-transparent border-b-2 py-4 px-1 ${getFontSizeClass('sm')} ${getFontWeightClass('medium')} flex items-center gap-2`}
            >
              <MessageSquare className="w-4 h-4" />
              Discussions
            </Link>
            <Link 
              href="#" 
              className={`${getColorClass('secondary')} hover:${getColorClass('primary')} border-transparent border-b-2 py-4 px-1 ${getFontSizeClass('sm')} ${getFontWeightClass('medium')} flex items-center gap-2`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link 
              href="#" 
              className={`${getColorClass('secondary')} hover:${getColorClass('primary')} border-transparent border-b-2 py-4 px-1 ${getFontSizeClass('sm')} ${getFontWeightClass('medium')} flex items-center gap-2`}
            >
              <Users className="w-4 h-4" />
              Members
            </Link>
          </nav>
        </div>
      </div>

      {/* Post Discussion Container */}
      <div className="rounded-lg border bg-card">
        <textarea
          placeholder="Start a discussion..."
          className={`w-full min-h-[100px] p-4 rounded-t-lg bg-background resize-none focus:outline-none ${getColorClass('primary', 800)}`}
        />
        <div className="flex justify-end p-3 bg-muted/50 rounded-b-lg border-t">
          <Button>Post Discussion</Button>
        </div>
      </div>

      {/* Group description */}
      <div className={`prose max-w-none ${getColorClass('primary', 800)}`}>
        <p>{group.description}</p>
      </div>

      {/* Cover image if exists */}
      {group.cover_image && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <img
            src={group.cover_image}
            alt={`${group.name} cover`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  )
} 