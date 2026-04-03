import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT, getAuthCookieName } from '@/lib/auth'

const protectedPaths = [
  '/api/transactions',
  '/api/accounts',
  '/api/budgets',
  '/api/goals',
  '/api/categories',
  '/api/notifications',
]

const adminPaths = [
  '/api/users',
  '/api/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))

  if (!isProtected && !isAdminPath) {
    return NextResponse.next()
  }

  const cookieName = getAuthCookieName()
  const token = request.cookies.get(cookieName)?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    response.cookies.delete(cookieName)
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
