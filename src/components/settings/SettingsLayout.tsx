'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Shield, Bell, User } from 'lucide-react'

interface SettingsLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Privacy', href: '/settings/privacy', icon: Shield },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Account', href: '/settings/account', icon: Settings },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group rounded-md px-3 py-2 flex items-center text-sm font-medium
                      ${isActive
                        ? 'bg-gray-50 text-blue-700 hover:text-blue-700 hover:bg-white'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        flex-shrink-0 -ml-1 mr-3 h-6 w-6
                        ${isActive
                          ? 'text-blue-700 group-hover:text-blue-700'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 