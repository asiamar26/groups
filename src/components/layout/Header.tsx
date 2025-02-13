'use client'

import React, { useState } from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface HeaderProps {
  isSidebarCollapsed?: boolean
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed }) => {
  const { user } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className={`h-14 bg-white border-b px-4 flex items-center justify-between fixed top-0 right-0 ${isSidebarCollapsed ? 'left-20' : 'left-64'} z-10 transition-all duration-300`}>
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-1.5 text-gray-600 hover:text-blue-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
          >
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm uppercase">
              {user?.email?.[0] || 'U'}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Your Profile
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <div className="border-t my-1"></div>
              <div className="px-2 py-1">
                <LogoutButton variant="link" className="w-full text-left px-2 py-1" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 