import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Notification, getUserNotifications, markAllNotificationsAsRead, getUnreadNotificationsCount } from '@/utils/notifications'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadNotifications() {
    try {
      setIsLoading(true)
      console.log('Fetching notifications...')
      const data = await getUserNotifications()
      console.log('Notifications received:', data)
      setNotifications(data)
      
      console.log('Fetching unread count...')
      const count = await getUnreadNotificationsCount()
      console.log('Unread count:', count)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)
    if (open && unreadCount > 0) {
      try {
        console.log('Marking notifications as read...')
        await markAllNotificationsAsRead()
        setUnreadCount(0)
        await loadNotifications() // Refresh to get updated read status
      } catch (error) {
        console.error('Error marking notifications as read:', error)
        toast.error('Failed to mark notifications as read')
      }
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false)
    if (notification.group_id) {
      router.push(`/groups/${notification.group_id}`)
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <h3 className="font-semibold mb-2">Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notifications
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
} 