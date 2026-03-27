import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminSecret = searchParams.get('secret')

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, isPremium } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: isPremium ?? true },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
      }
    })

    return NextResponse.json({ user, message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminSecret = searchParams.get('secret')

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams: urlSearchParams } = new URL(request.url)
    const userId = urlSearchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}