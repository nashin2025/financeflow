import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const accountId = searchParams.get('accountId')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (accountId) where.accountId = accountId
    if (categoryId) where.categoryId = categoryId

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, type: true, icon: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { date: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
    })

    const total = await prisma.transaction.count({ where })

    return NextResponse.json({ transactions, total, limit, offset })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, amount, currency, description, merchantName, date, note, accountId, categoryId, isRecurring, isExcluded, tags } = body

    if (!type || !amount || !date) {
      return NextResponse.json({ error: 'Type, amount, and date are required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        currency: currency || 'MVR',
        description: description || null,
        merchantName: merchantName || null,
        date: new Date(date),
        note: note || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
        isRecurring: isRecurring || false,
        isExcluded: isExcluded || false,
        tags: tags ? JSON.stringify(tags) : '[]',
      },
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    })

    return NextResponse.json({ transaction, message: 'Transaction created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
