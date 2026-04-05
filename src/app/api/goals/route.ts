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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { userId }
    if (status) where.status = status

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, targetAmount, targetDate, icon, color, monthlyContribution } = body

    if (!name || !type || !targetAmount || !targetDate) {
      return NextResponse.json({ error: 'Name, type, targetAmount, and targetDate are required' }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        type,
        targetAmount: parseFloat(targetAmount),
        targetDate: new Date(targetDate),
        icon: icon || null,
        color: color || null,
        monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0,
        userId,
      },
    })

    return NextResponse.json({ goal, message: 'Goal created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
