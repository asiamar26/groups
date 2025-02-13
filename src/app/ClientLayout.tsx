'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/layout/Navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { ChevronDown } from 'lucide-react'

// Routes that should not show navigation
const publicRoutes = ['/', '/login', '/signup']
const settingsRoutes = ['/settings', '/settings/profile', '/settings/privacy', '/settings/notifications', '/settings/account', '/settings/password', '/settings/email', '/settings/security']

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const isPublicRoute = publicRoutes.includes(pathname || '')
  const isSettingsRoute = pathname ? settingsRoutes.some(route => pathname.startsWith(route)) : false
  const shouldShowNavigation = !isPublicRoute && !isSettingsRoute
  const userAvatar = user?.user_metadata?.avatar_url
  const userName = user?.user_metadata?.full_name || 'Your Profile'

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        {shouldShowNavigation && (
          <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
              <h1 className="text-xl font-bold text-blue-600">GroupConnect</h1>
              <Link 
                href="/profile"
                className="flex items-center gap-3 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </Link>
            </div>
          </header>
        )}
        
        {shouldShowNavigation && <Navigation />}
        
        {/* Main Content */}
        <main className={`${shouldShowNavigation ? 'md:pl-64 pt-16' : ''}`}>
          <div className="mx-auto h-full w-full max-w-7xl p-4 pb-24 md:p-8 md:pb-8">
            {children}
          </div>
        </main>

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#f44336',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  )
} 
