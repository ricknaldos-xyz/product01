import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/pricing', '/rankings']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Pattern-based public routes (dynamic segments)
  const publicPatterns = ['/reset-password/', '/verify-email/', '/player/', '/rankings/', '/marketplace', '/tienda', '/encordado']
  const isPublicPattern = publicPatterns.some((pattern) => pathname.startsWith(pattern))

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth', '/api/public', '/api/shop/products', '/api/stringing/workshops', '/api/stringing/coverage', '/api/cron', '/api/rankings', '/api/courts']
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

  // Admin route protection
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if ((isAdminPage || isAdminApi) && isLoggedIn) {
    const role = (req.auth as { user?: { role?: string } })?.user?.role

    if (role !== 'ADMIN') {
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images).*)'],
}
