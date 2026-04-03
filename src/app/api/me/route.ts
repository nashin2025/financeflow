import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            accounts: true,
            budgets: true,
            goals: true,
            categories: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
      },
    })

    return NextResponse.json({ user, message: 'Profile updated' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
