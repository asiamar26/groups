'use client'

import { useState, useEffect, ChangeEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { MessageSquare, Heart, MoreVertical, Reply, Paperclip, X, FileText, Image, Film, File } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  getGroupDiscussions,
  createDiscussion,
  getDiscussionReplies,
  createDiscussionReply,
  toggleDiscussionLike,
  type Discussion as DiscussionType,
  type DiscussionReply,
  type Attachment
} from '@/utils/discussions'

interface DiscussionProps {
  groupId: string
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function Discussion({ groupId }: DiscussionProps) {
  const [newPost, setNewPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [discussions, setDiscussions] = useState<DiscussionType[]>([])
  const [replies, setReplies] = useState<{ [key: string]: DiscussionReply[] }>({})
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({})
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({})
  const [isLoadingReplies, setIsLoadingReplies] = useState<{ [key: string]: boolean }>({})
  const [isLoadingLike, setIsLoadingLike] = useState<{ [key: string]: boolean }>({})
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDiscussions()
  }, [groupId])

  const loadDiscussions = async () => {
    try {
      const { data, error } = await getGroupDiscussions(groupId)
      if (error) throw error
      setDiscussions(data)
    } catch (error) {
      console.error('Error loading discussions:', error)
      toast.error('Failed to load discussions')
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 5) {
      toast.error('Maximum 5 files allowed')
      return
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    if (totalSize > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Total file size must be less than 10MB')
      return
    }

    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await createDiscussion(groupId, newPost.trim(), undefined, attachments)
      if (error) throw error
      if (data) {
        setDiscussions([data, ...discussions])
        setNewPost('')
        setAttachments([])
        toast.success('Discussion posted successfully')
      }
    } catch (error) {
      console.error('Error creating discussion:', error)
      toast.error('Failed to create discussion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadReplies = async (discussionId: string) => {
    if (isLoadingReplies[discussionId]) return

    setIsLoadingReplies(prev => ({ ...prev, [discussionId]: true }))
    try {
      const { data, error } = await getDiscussionReplies(discussionId)
      if (error) throw error
      setReplies(prev => ({ ...prev, [discussionId]: data }))
      setShowReplies(prev => ({ ...prev, [discussionId]: true }))
    } catch (error) {
      console.error('Error loading replies:', error)
      toast.error('Failed to load replies')
    } finally {
      setIsLoadingReplies(prev => ({ ...prev, [discussionId]: false }))
    }
  }

  const handleSubmitReply = async (discussionId: string) => {
    const content = replyContent[discussionId]?.trim()
    if (!content) return

    setIsLoadingReplies(prev => ({ ...prev, [discussionId]: true }))
    try {
      const { data, error } = await createDiscussionReply(discussionId, content)
      if (error) throw error
      if (data) {
        setReplies(prev => ({
          ...prev,
          [discussionId]: [...(prev[discussionId] || []), data]
        }))
        setReplyContent(prev => ({ ...prev, [discussionId]: '' }))
        toast.success('Reply posted successfully')
      }
    } catch (error) {
      console.error('Error creating reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsLoadingReplies(prev => ({ ...prev, [discussionId]: false }))
    }
  }

  const handleToggleLike = async (discussionId: string) => {
    if (isLoadingLike[discussionId]) return

    setIsLoadingLike(prev => ({ ...prev, [discussionId]: true }))
    try {
      const { error } = await toggleDiscussionLike(discussionId)
      if (error) throw error
      
      setDiscussions(prev => prev.map(discussion => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            likesCount: discussion.isLiked ? discussion.likesCount - 1 : discussion.likesCount + 1,
            isLiked: !discussion.isLiked
          }
        }
        return discussion
      }))
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    } finally {
      setIsLoadingLike(prev => ({ ...prev, [discussionId]: false }))
    }
  }

  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('video/')) return <Film className="w-4 h-4" />
    if (type.startsWith('text/')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Start a discussion..."
            value={newPost}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted p-2 rounded-md"
                >
                  {getAttachmentIcon(file.type)}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatBytes(file.size)})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAttachmentClick}
              className="gap-2"
            >
              <Paperclip className="w-4 h-4" />
              Add Attachment
            </Button>
            <Button type="submit" disabled={isLoading || !newPost.trim()}>
              {isLoading ? 'Posting...' : 'Post Discussion'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf,text/*"
          />
        </form>
      </Card>

      {/* Discussion List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={discussion.user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {discussion.user.displayName?.[0] || discussion.user.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {discussion.user.displayName || discussion.user.email}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-2">{discussion.content}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Attachments */}
            {discussion.attachments && discussion.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {discussion.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-muted p-2 rounded-md hover:bg-muted/80"
                  >
                    {getAttachmentIcon(attachment.type)}
                    <span className="text-sm truncate max-w-[200px]">
                      {attachment.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({formatBytes(attachment.size)})
                    </span>
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => handleToggleLike(discussion.id)}
                disabled={isLoadingLike[discussion.id]}
              >
                <Heart
                  className={`h-4 w-4 ${discussion.isLiked ? 'fill-current text-red-500' : ''}`}
                />
                <span>{discussion.likesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => handleLoadReplies(discussion.id)}
                disabled={isLoadingReplies[discussion.id]}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{discussion.repliesCount} replies</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowReplies(prev => ({
                  ...prev,
                  [discussion.id]: !prev[discussion.id]
                }))}
              >
                <Reply className="h-4 w-4" />
                Reply
              </Button>
            </div>

            {/* Replies Section */}
            {showReplies[discussion.id] && (
              <div className="pl-12 space-y-4">
                {/* Reply Input */}
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent[discussion.id] || ''}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReplyContent(prev => ({
                      ...prev,
                      [discussion.id]: e.target.value
                    }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSubmitReply(discussion.id)}
                    disabled={isLoadingReplies[discussion.id] || !replyContent[discussion.id]?.trim()}
                  >
                    Reply
                  </Button>
                </div>

                {/* Reply List */}
                {replies[discussion.id]?.map((reply) => (
                  <Card key={reply.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {reply.user.displayName?.[0] || reply.user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {reply.user.displayName || reply.user.email}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-2">{reply.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 