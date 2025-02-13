/**
 * Authentication Middleware
 * Handles protected routes and redirects based on auth state
 */

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile/edit', '/groups']
// Auth routes that should redirect to dashboard if user is already authenticated
const AUTH_ROUTES = ['/login', '/signup']
// Public routes that don't need auth checks
const PUBLIC_ROUTES = ['/', '/about', '/contact']

export async function middleware(req: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next()
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    // Skip auth check for public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return res
    }

    // Handle auth errors
    if (sessionError) {
      console.error('Middleware - Session error:', sessionError)
      if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      return res
    }

    // Handle protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      if (!session) {
        console.log('Middleware - No session, redirecting to login')
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      console.log('Middleware - Session found, allowing access to protected route')
    }

    // Handle auth routes (login/signup)
    if (AUTH_ROUTES.includes(pathname)) {
      if (session) {
        console.log('Middleware - Session exists on auth route, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      console.log('Middleware - No session on auth route, allowing access')
    }

    // Update response with new session
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Only redirect to login for protected routes on error
    if (PROTECTED_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 