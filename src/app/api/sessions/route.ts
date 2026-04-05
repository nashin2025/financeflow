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

    const sessions = await prisma.$queryRaw`
      SELECT id, "userId", "loginAt", "ipAddress", "userAgent", "location"
      FROM "LoginSession"
      WHERE "userId" = ${userId}
      ORDER BY "loginAt" DESC
      LIMIT 20
    `

    return NextResponse.json({ sessions })
  } catch {
    return NextResponse.json({ sessions: [] })
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
    const { ipAddress, userAgent, location } = body

    await prisma.$executeRaw`
      INSERT INTO "LoginSession" ("userId", "loginAt", "ipAddress", "userAgent", "location")
      VALUES (${userId}, NOW(), ${ipAddress || ''}, ${userAgent || ''}, ${location || ''})
    `

    return NextResponse.json({ message: 'Session recorded' })
  } catch (error) {
    console.error('Error recording session:', error)
    return NextResponse.json({ error: 'Failed to record session' }, { status: 500 })
  }
}
