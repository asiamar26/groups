'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, Users, Calendar } from 'lucide-react'

interface GroupTabsProps {
  groupId: string
}

export function GroupTabs({ groupId }: GroupTabsProps) {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'About',
      href: `/groups/${groupId}`,
      icon: FileText,
      exact: true
    },
    {
      name: 'Discussions',
      href: `/groups/${groupId}/discussions`,
      icon: FileText
    },
    {
      name: 'Events',
      href: `/groups/${groupId}/events`,
      icon: Calendar
    },
    {
      name: 'Members',
      href: `/groups/${groupId}/members`,
      icon: Users
    }
  ]

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? pathname === tab.href
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 