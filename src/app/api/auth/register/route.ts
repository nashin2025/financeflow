import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAccessJWT, createRefreshJWT, validateEmail, validatePassword } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail, verificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(`register:${ip}`, { windowMs: 15 * 60 * 1000, max: 3 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 })
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim() || email.split('@')[0],
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailData = verificationEmail(user.name || '', verificationToken, baseUrl)
    await sendEmail(user.email, emailData.subject, emailData.html)

    const accessToken = await createAccessJWT({
      userId: user.id,
      email: user.email,
      isPremium: user.isPremium,
      isAdmin: false,
    })

    const refreshToken = await createRefreshJWT({ userId: user.id })

    const response = NextResponse.json({ 
      user, 
      message: 'User created successfully. Please check your email to verify your account.',
      requiresVerification: true,
    })
    await setAuthCookiesOnResponse(response, accessToken, refreshToken)

    return response
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

async function setAuthCookiesOnResponse(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set('__Host-ff-access', accessToken, {
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
