'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  Key, 
  Mail,
  Globe,
  Users,
  MessageSquare,
  Palette,
  Database,
  Activity
} from 'lucide-react'

const settingsCategories = [
  {
    name: 'Account',
    description: 'Manage your account settings, password, and email preferences',
    items: [
      { 
        name: 'Account Settings', 
        href: '/settings/account', 
        icon: Settings,
        description: 'View and update your account information'
      },
      { 
        name: 'Password', 
        href: '/settings/password', 
        icon: Key,
        description: 'Change your password and security settings'
      },
      { 
        name: 'Email', 
        href: '/settings/email', 
        icon: Mail,
        description: 'Update your email and notification preferences'
      },
    ],
  },
  {
    name: 'Privacy & Safety',
    description: 'Control your privacy settings and manage your data',
    items: [
      { 
        name: 'Privacy', 
        href: '/settings/privacy', 
        icon: Lock,
        description: 'Manage who can see your information'
      },
      { 
        name: 'Security', 
        href: '/settings/security', 
        icon: Shield,
        description: 'Configure your account security settings'
      },
      { 
        name: 'Notifications', 
        href: '/settings/notifications', 
        icon: Bell,
        description: 'Choose how you want to be notified'
      },
    ],
  },
  {
    name: 'Groups & Communication',
    description: 'Customize your group interactions and messaging preferences',
    items: [
      {
        name: 'Group Settings',
        href: '/settings/groups',
        icon: Users,
        description: 'Manage group invites, defaults, and visibility'
      },
      {
        name: 'Messaging',
        href: '/settings/messaging',
        icon: MessageSquare,
        description: 'Set up messaging preferences and blocked users'
      },
      {
        name: 'Language & Region',
        href: '/settings/language',
        icon: Globe,
        description: 'Change your language and regional preferences'
      }
    ]
  },
  {
    name: 'Appearance & Data',
    description: 'Customize your experience and manage your data',
    items: [
      {
        name: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
        description: 'Customize theme, colors, and display options'
      },
      {
        name: 'Data Usage',
        href: '/settings/data',
        icon: Database,
        description: 'Control data usage and storage settings'
      },
      {
        name: 'Activity Log',
        href: '/settings/activity',
        icon: Activity,
        description: 'View your account activity and login history'
      }
    ]
  }
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {settingsCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex items-start p-4 space-x-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-50 text-blue-600">
                      <item.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 