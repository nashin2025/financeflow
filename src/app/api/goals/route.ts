import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
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
    const body = await request.json()
    const { name, type, targetAmount, targetDate, icon, color, monthlyContribution, userId } = body

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
        userId: userId || '1',
      },
    })

    return NextResponse.json({ goal, message: 'Goal created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
