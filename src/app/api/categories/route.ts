import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (isActive !== null) where.isActive = isActive === 'true'

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { sortOrder: 'asc' }],
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, icon, color, sortOrder, userId } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon: icon || null,
        color: color || null,
        sortOrder: sortOrder || 0,
        userId: userId || '1',
      },
    })

    return NextResponse.json({ category, message: 'Category created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
