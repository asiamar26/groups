'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, Users, MessageSquare, Settings, UserPlus, Plus
} from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { NotificationBell } from '@/components/NotificationBell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreatePostForm } from '@/components/posts/CreatePostForm'

const navigationItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/members', icon: UserPlus, label: 'Members' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badge: 2 },
  { href: '/settings', icon: Settings, label: 'Settings' }
]

// Mobile navigation items (limited set)
const mobileItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  const userAvatar = user?.user_metadata?.avatar_url

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">GroupConnect</h1>
          </div>

          {/* Profile Section */}
          <Link href="/profile" className="p-4 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-blue-100">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt="Profile"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-blue-600 text-base font-semibold uppercase">
                    {user?.email?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || 'Your Profile'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email || 'Complete your profile'}
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
              {/* Notifications */}
              <div className="px-3">
                <NotificationBell />
              </div>
            </div>
          </nav>

          {/* Logout Button - Desktop */}
          <div className="p-4 border-t">
            <LogoutButton variant="menu-item" className="w-full" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <nav className="flex items-center justify-between px-3 py-2">
          <Link href="/dashboard" className="flex flex-col items-center min-w-[3rem]">
            <Home className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-0.5">Home</span>
          </Link>

          <Link href="/groups" className="flex flex-col items-center min-w-[3rem]">
            <Users className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-0.5">Groups</span>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center -mt-5"
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <CreatePostForm />
            </DialogContent>
          </Dialog>

          <div className="flex flex-col items-center min-w-[3rem]">
            <div className="text-muted-foreground">
              <NotificationBell />
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">Notifications</span>
          </div>

          <Link href="/settings" className="flex flex-col items-center min-w-[3rem]">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-0.5">Settings</span>
          </Link>
        </nav>
      </div>
    </>
  )
} 