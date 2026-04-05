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

    const now = new Date()
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const bills = await prisma.transaction.findMany({
      where: {
        userId,
        isRecurring: true,
        date: { gte: now, lte: in14Days },
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ bills })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
  }
}
