import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Create user (in production, hash the password!)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: password, // TODO: Hash this in production!
        isPremium: false,
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
      }
    })

    return NextResponse.json({ user, message: 'User created successfully' })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}