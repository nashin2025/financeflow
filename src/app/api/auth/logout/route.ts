import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  const isProd = process.env.NODE_ENV === 'production'
  
  response.cookies.delete('__Host-ff-access')
  response.cookies.delete('__Host-ff-refresh')
  response.cookies.delete('ff-access')
  response.cookies.delete('ff-refresh')
  
  if (!isProd) {
    response.cookies.delete('ff-access', { path: '/' })
    response.cookies.delete('ff-refresh', { path: '/' })
  }
  
  return response
}
