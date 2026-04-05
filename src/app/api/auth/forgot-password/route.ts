import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateEmail } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'
import { sendEmail, resetPasswordEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(`forgot-password:${ip}`, { windowMs: 60 * 60 * 1000, max: 3 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' }, { status: 200 })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailData = resetPasswordEmail(user.name || '', resetToken, baseUrl)
    await sendEmail(user.email, emailData.subject, emailData.html)

    return NextResponse.json({ message: 'If an account exists with that email, a reset link has been sent.' })
  } catch (error) {
    console.error('Error processing forgot password:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
