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
    const format = searchParams.get('format') || 'csv'

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    if (format === 'csv') {
      const headers = ['Date', 'Type', 'Amount', 'Currency', 'Description', 'Merchant', 'Category', 'Account', 'Note', 'Tags']
      const rows = transactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.type,
        t.amount.toString(),
        t.currency,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.merchantName || '').replace(/"/g, '""')}"`,
        t.category?.name || '',
        t.account?.name || '',
        `"${(t.note || '').replace(/"/g, '""')}"`,
        `"${Array.isArray(t.tags) ? t.tags.join(';') : ''}"`,
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financeflow_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify({ transactions }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="financeflow_export_${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format. Use csv or json' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
