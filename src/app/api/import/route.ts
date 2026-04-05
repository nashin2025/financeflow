import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getHeaders } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const headers = getHeaders(request)
    const userId = headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { transactions } = body

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions to import' }, { status: 400 })
    }

    const created: any[] = []
    const errors: any[] = []
    let duplicates = 0

    for (const t of transactions) {
      try {
        if (!t.type || !t.amount || !t.date) {
          errors.push({ row: transactions.indexOf(t) + 1, error: 'Missing required fields: type, amount, date' })
          continue
        }

        const existing = await prisma.transaction.findFirst({
          where: {
            userId,
            amount: parseFloat(t.amount),
            date: new Date(t.date),
            description: t.description || null,
          },
        })

        if (existing) {
          duplicates++
          continue
        }

        const transaction = await prisma.transaction.create({
          data: {
            userId,
            type: t.type,
            amount: parseFloat(t.amount),
            date: new Date(t.date),
            description: t.description || null,
            merchantName: t.merchantName || null,
            note: t.note || null,
            currency: t.currency || 'MVR',
            tags: t.tags ? JSON.stringify(t.tags) : '[]',
          },
        })

        created.push(transaction)
      } catch (err: any) {
        errors.push({ row: transactions.indexOf(t) + 1, error: err.message })
      }
    }

    return NextResponse.json({
      imported: created.length,
      duplicates,
      errors,
      total: transactions.length,
    })
  } catch (error) {
    console.error('Error importing transactions:', error)
    return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 })
  }
}
