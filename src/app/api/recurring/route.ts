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
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const recurringTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        isRecurring: true,
        date: { lte: in30Days },
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ recurring: recurringTransactions })
  } catch (error) {
    console.error('Error fetching recurring:', error)
    return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 })
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
    const { amount, type, categoryId, accountId, description, merchantName, date, note, frequency, endDate } = body

    if (!amount || !type || !frequency) {
      return NextResponse.json({ error: 'Amount, type, and frequency are required' }, { status: 400 })
    }

    const startDate = new Date(date || Date.now())
    const end = endDate ? new Date(endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000)

    const occurrences: any[] = []
    let current = new Date(startDate)

    while (current <= end) {
      occurrences.push({
        userId,
        amount,
        type,
        categoryId: categoryId || null,
        accountId: accountId || null,
        description: description || null,
        merchantName: merchantName || null,
        date: new Date(current),
        note: note || null,
        isRecurring: true,
        currency: 'MVR',
      })

      switch (frequency) {
        case 'daily': current.setDate(current.getDate() + 1); break
        case 'weekly': current.setDate(current.getDate() + 7); break
        case 'biweekly': current.setDate(current.getDate() + 14); break
        case 'monthly': current.setMonth(current.getMonth() + 1); break
        case 'yearly': current.setFullYear(current.getFullYear() + 1); break
        default: current.setMonth(current.getMonth() + 1)
      }
    }

    const created = await prisma.transaction.createMany({
      data: occurrences,
    })

    return NextResponse.json({ created: created.count, message: `Created ${created.count} recurring transactions` }, { status: 201 })
  } catch (error) {
    console.error('Error creating recurring:', error)
    return NextResponse.json({ error: 'Failed to create recurring transactions' }, { status: 500 })
  }
}
