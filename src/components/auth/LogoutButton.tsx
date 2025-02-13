'use client'

import React, { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { signOut } from '@/utils/auth'
import { toast } from 'react-hot-toast'

interface LogoutButtonProps {
  className?: string
  variant?: 'button' | 'link' | 'menu-item'
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '', 
  variant = 'button' 
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      const { error } = await signOut()
      if (error) throw error
    } catch (err) {
      console.error('Error signing out:', err)
      toast.error('Failed to sign out. Please try again.')
      setIsLoading(false)
    }
  }

  const LoadingIcon = () => (
    <Loader2 className="h-4 w-4 animate-spin" />
  )

  if (variant === 'link') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-gray-700 hover:text-gray-900 disabled:opacity-50 flex items-center gap-2 ${className}`}
      >
        {isLoading ? <LoadingIcon /> : <LogOut className="h-4 w-4" />}
        <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
      </button>
    )
  }

  if (variant === 'menu-item') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 ${className}`}
      >
        {isLoading ? <LoadingIcon /> : <LogOut className="h-4 w-4" />}
        <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${className}`}
    >
      {isLoading ? <LoadingIcon /> : <LogOut className="h-4 w-4 mr-2" />}
      <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
    </button>
  )
} 