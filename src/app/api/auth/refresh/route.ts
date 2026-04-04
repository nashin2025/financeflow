import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createAccessJWT, createRefreshJWT, verifyRefreshJWT } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(`refresh:${ip}`, { windowMs: 60 * 1000, max: 10 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }

    const cookies = request.headers.get('cookie') || ''
    const getCookie = (name: string) => {
      const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
      return match ? decodeURIComponent(match[1]) : null
    }

    const refreshToken = getCookie('__Host-ff-refresh') || getCookie('ff-refresh')

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const payload = await verifyRefreshJWT(refreshToken)
    if (!payload) {
      const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
      response.cookies.delete('__Host-ff-refresh')
      response.cookies.delete('ff-refresh')
      return response
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isPremium: true, isAdmin: true }
    })

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 401 })
      response.cookies.delete('__Host-ff-refresh')
      response.cookies.delete('ff-refresh')
      return response
    }

    const newAccessToken = await createAccessJWT({
      userId: user.id,
      email: user.email,
      isPremium: user.isPremium,
      isAdmin: user.isAdmin,
    })

    const newRefreshToken = await createRefreshJWT({ userId: user.id })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isPremium: user.isPremium,
      }
    })

    const isProd = process.env.NODE_ENV === 'production'
    response.cookies.set('__Host-ff-access', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    })
    response.cookies.set('__Host-ff-refresh', newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    response.cookies.set('ff-access', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    })
    response.cookies.set('ff-refresh', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Error refreshing token:', error)
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
  }
}
