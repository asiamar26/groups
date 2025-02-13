'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditGroupForm } from "./EditGroupForm"
import type { GroupWithMemberInfo } from "@/types/groups"

interface EditGroupDialogProps {
  group: GroupWithMemberInfo
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function EditGroupDialog({ group, trigger, onSuccess }: EditGroupDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Group Settings</DialogTitle>
          <DialogDescription>
            Make changes to your group settings here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <EditGroupForm 
          group={group} 
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
} 