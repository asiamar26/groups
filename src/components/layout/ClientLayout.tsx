'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import { Toaster } from 'react-hot-toast'

// Routes that should not show navigation
const publicRoutes = ['/', '/login', '/signup']
const settingsRoutes = ['/settings', '/settings/profile', '/settings/privacy', '/settings/notifications', '/settings/account', '/settings/password', '/settings/email', '/settings/security']

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.includes(pathname || '')
  const isSettingsRoute = pathname ? settingsRoutes.some(route => pathname.startsWith(route)) : false
  const shouldShowNavigation = !isPublicRoute && !isSettingsRoute

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavigation && <Navigation />}
      
      {/* Main Content */}
      <main className={`${shouldShowNavigation ? 'md:pl-20' : ''} pt-0 md:pt-0`}>
        <div className="p-4 md:p-8 pb-20 md:pb-8">
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
  )
} 