import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAccessJWT, createRefreshJWT, setAuthCookies, validateEmail, validatePassword } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import speakeasy from 'speakeasy'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, twoFAToken } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.twoFactorEnabled) {
      if (!twoFAToken) {
        return NextResponse.json({
          requires2FA: true,
          userId: user.id,
        })
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: twoFAToken,
        window: 2,
      })

      if (!verified) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 })
      }
    }

    const accessToken = await createAccessJWT({
      userId: user.id,
      email: user.email,
      isPremium: user.isPremium,
      isAdmin: user.isAdmin,
    })

    const refreshToken = await createRefreshJWT({ userId: user.id })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      }
    })

    await setAuthCookiesOnResponse(response, accessToken, refreshToken)

    return response
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}

async function setAuthCookiesOnResponse(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set('__Host-ff-access' , accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  })
  response.cookies.set('__Host-ff-refresh', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  response.cookies.set('ff-access', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  })
  response.cookies.set('ff-refresh', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}
