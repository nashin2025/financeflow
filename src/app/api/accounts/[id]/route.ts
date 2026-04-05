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
    const { name, balance, currency, color, icon, institution, type, isActive } = body

    const account = await prisma.account.findUnique({ where: { id } })
    if (!account || account.userId !== userId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(balance !== undefined && { balance }),
        ...(currency !== undefined && { currency }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(institution !== undefined && { institution }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ account: updated })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
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

    const account = await prisma.account.findUnique({ where: { id } })
    if (!account || account.userId !== userId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.account.delete({ where: { id } })
    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
