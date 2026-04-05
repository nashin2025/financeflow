import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production'
)
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production-refresh'
)

export interface JWTPayload {
  userId: string
  email: string
  isPremium: boolean
  isAdmin: boolean
}

export async function createAccessJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    isPremium: payload.isPremium,
    isAdmin: payload.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)
}

export async function createRefreshJWT(payload: { userId: string }): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      isPremium: payload.isPremium as boolean,
      isAdmin: payload.isAdmin as boolean,
    }
  } catch {
    return null
  }
}

export async function verifyRefreshJWT(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return { userId: payload.sub as string }
  } catch {
    return null
  }
}

export function getAccessCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-ff-access' : 'ff-access'
}

export function getRefreshCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-ff-refresh' : 'ff-refresh'
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  const accessName = getAccessCookieName()
  const refreshName = getRefreshCookieName()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set(accessName, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  })

  cookieStore.set(refreshName, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(getAccessCookieName())
  cookieStore.delete(getRefreshCookieName())
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAccessCookieName())?.value
  if (!token) return null
  return verifyAccessJWT(token)
}

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be less than ${PASSWORD_MAX_LENGTH} characters`
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return 'Email is required'
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Invalid email format'
  }
  if (email.length > 255) {
    return 'Email is too long'
  }
  return null
}

export function getHeaders(request: Request): Headers {
  return request.headers
}
