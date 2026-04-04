import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (isActive !== null) where.isActive = isActive === 'true'

    const accounts = await prisma.account.findMany({
      where,
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { balance: 'desc' },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, balance, currency, color, icon, institution, userId } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance ? parseFloat(balance) : 0,
        currency: currency || 'MVR',
        color: color || null,
        icon: icon || null,
        institution: institution || null,
        userId: userId || '1',
      },
    })

    return NextResponse.json({ account, message: 'Account created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
