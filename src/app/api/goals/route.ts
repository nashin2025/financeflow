import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { currentAmount } = body

    if (currentAmount === undefined) {
      return NextResponse.json({ error: 'currentAmount is required' }, { status: 400 })
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: parseFloat(currentAmount),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ goal: updatedGoal, message: 'Goal updated' })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}