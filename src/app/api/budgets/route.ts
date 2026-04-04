import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null) where.isActive = isActive === 'true'

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ budgets })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, amount, period, categoryId, startDate, rollover, alertThreshold, userId } = body

    if (!name || !amount) {
      return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 })
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        period: period || 'monthly',
        categoryId: categoryId || null,
        startDate: startDate ? new Date(startDate) : null,
        rollover: rollover || false,
        alertThreshold: alertThreshold || 75,
        userId: userId || '1',
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json({ budget, message: 'Budget created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 })
  }
}
