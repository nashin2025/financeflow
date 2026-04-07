import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { generateSmartNotifications } from '@/lib/notification-engine'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limit: 1 request per minute
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const limit = rateLimit(`notifications-generate:${ip}`, { windowMs: 60 * 1000, max: 1 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await generateSmartNotifications(user.userId)

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Error generating notifications:', error)
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 })
  }
}
