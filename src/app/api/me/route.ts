import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getHeaders } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isAdmin: true,
        emailVerified: true,
        twoFactorEnabled: true,
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

export async function PATCH(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        isAdmin: true,
        emailVerified: true,
      },
    })

    return NextResponse.json({ user, message: 'Profile updated' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { confirmDelete } = body

    if (confirmDelete !== 'DELETE') {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: userId } })

    const response = NextResponse.json({ message: 'Account deleted successfully' })
    response.cookies.delete('__Host-ff-access')
    response.cookies.delete('__Host-ff-refresh')
    response.cookies.delete('ff-access')
    response.cookies.delete('ff-refresh')

    return response
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
