import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/signout',
  '/_next',
  '/favicon.ico',
  '/placeholder',
  '/spool-logo'
]

// List of paths that require authentication
const protectedPaths = [
  '/topic',
  '/api/content',
  '/api/user',
  '/api/progress'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Check if path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // If it's a protected path, we'll rely on the AuthGuard component
  // and AWS Amplify's session management to handle authentication
  // The middleware just serves as an additional layer of documentation
  // about which routes are protected
  
  if (isProtectedPath) {
    // Log protected route access (in production, you might want to add monitoring here)
    console.log(`Protected route accessed: ${pathname}`)
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 