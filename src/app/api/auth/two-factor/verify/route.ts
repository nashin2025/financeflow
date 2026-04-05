import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import speakeasy from 'speakeasy'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, token, backupCode } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ verified: true })
    }

    if (backupCode) {
      const codes: string[] = JSON.parse(user.twoFactorBackupCodes || '[]')
      const index = codes.indexOf(backupCode.toUpperCase())
      if (index === -1) {
        return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 })
      }
      codes.splice(index, 1)
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: JSON.stringify(codes) },
      })
      return NextResponse.json({ verified: true })
    }

    if (!token) {
      return NextResponse.json({ requires2FA: true })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 2,
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error('Error verifying 2FA:', error)
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
  }
}
