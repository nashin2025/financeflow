import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getHeaders } from '@/lib/auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, targetAmount, currentAmount, type, targetDate, status, icon, color, monthlyContribution } = body

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(currentAmount !== undefined && { currentAmount }),
        ...(type !== undefined && { type }),
        ...(targetDate !== undefined && { targetDate: new Date(targetDate) }),
        ...(status !== undefined && { status }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(monthlyContribution !== undefined && { monthlyContribution }),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    })

    return NextResponse.json({ goal: updated })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal || goal.userId !== userId) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    await prisma.goal.delete({ where: { id } })
    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
