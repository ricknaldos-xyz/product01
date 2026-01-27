import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/pricing']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Pattern-based public routes (dynamic segments)
  const publicPatterns = ['/reset-password/', '/verify-email/']
  const isPublicPattern = publicPatterns.some((pattern) => pathname.startsWith(pattern))

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth']
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route))

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && !isPublicRoute && !isPublicPattern && !isPublicApiRoute) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images).*)'],
}
