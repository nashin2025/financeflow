import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type, amount, currency, description, merchantName, date, note, accountId, categoryId, isRecurring, isExcluded, tags } = body

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(currency && { currency }),
        ...(description !== undefined && { description }),
        ...(merchantName !== undefined && { merchantName }),
        ...(date && { date: new Date(date) }),
        ...(note !== undefined && { note }),
        ...(accountId !== undefined && { accountId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(isExcluded !== undefined && { isExcluded }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        updatedAt: new Date(),
      },
      include: {
        account: { select: { id: true, name: true, type: true, icon: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json({ transaction, message: 'Transaction updated' })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Transaction deleted' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}