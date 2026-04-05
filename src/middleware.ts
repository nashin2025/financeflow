import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessJWT } from '@/lib/auth'

const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/me',
  '/api/auth/change-password',
]

const protectedPaths = [
  '/api/transactions',
  '/api/accounts',
  '/api/budgets',
  '/api/goals',
  '/api/categories',
  '/api/notifications',
  '/api/me',
]

const adminPaths = [
  '/api/users',
  '/api/admin',
]

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookies = request.cookies.getAll()
  return cookies.find(c => c.name === name)?.value
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicApiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))

  if (!isProtected && !isAdminPath) {
    return NextResponse.next()
  }

  // Check admin secret first (allows admin panel without JWT)
  if (isAdminPath) {
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret && secret === process.env.ADMIN_SECRET) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', 'admin')
      requestHeaders.set('x-user-email', 'admin@financeflow.app')
      requestHeaders.set('x-user-is-premium', 'true')
      requestHeaders.set('x-user-is-admin', 'true')
      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    }
  }

  const accessToken = getCookie(request, '__Host-ff-access') || getCookie(request, 'ff-access')

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyAccessJWT(accessToken)

  if (!payload) {
    const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    response.cookies.delete('__Host-ff-access')
    response.cookies.delete('__Host-ff-refresh')
    response.cookies.delete('ff-access')
    response.cookies.delete('ff-refresh')
    return response
  }

  if (isAdminPath && !payload.isAdmin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-is-premium', String(payload.isPremium))
  requestHeaders.set('x-user-is-admin', String(payload.isAdmin))

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/api/:path*'],
}
