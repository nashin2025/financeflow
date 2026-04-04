import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAccessJWT } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookies = request.headers.get('cookie') || ''
    const getCookie = (name: string) => {
      const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
      return match ? decodeURIComponent(match[1]) : null
    }

    const accessToken = getCookie('__Host-ff-access') || getCookie('ff-access')

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = await verifyAccessJWT(accessToken)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
