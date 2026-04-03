import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production'
)

export interface JWTPayload {
  userId: string
  email: string
  isPremium: boolean
  isAdmin: boolean
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    isPremium: payload.isPremium,
    isAdmin: payload.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
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

export function getAuthCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-ff-auth' : 'ff-auth'
}
