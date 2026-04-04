import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  response.cookies.delete('__Host-ff-access')
  response.cookies.delete('__Host-ff-refresh')
  response.cookies.delete('ff-access')
  response.cookies.delete('ff-refresh')
  
  return response
}
