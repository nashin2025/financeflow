import { NextResponse } from 'next/server'
import { getAuthCookieName } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  response.cookies.delete(getAuthCookieName())
  return response
}
