'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex-1">
      {children}
    </main>
  )
} 