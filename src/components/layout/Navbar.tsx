'use client'

import React from 'react'
import Link from 'next/link'

/**
 * Navbar Component
 * Responsive navigation bar with mobile menu support
 */
export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-[#4070F4] text-xl font-semibold tracking-tight"
          >
            GroupConnect
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-x-6">
            <Link 
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#4070F4] hover:bg-[#3060E0] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 