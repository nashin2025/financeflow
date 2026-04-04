interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const DEFAULTS = {
  windowMs: 15 * 60 * 1000,
  max: 10,
}

export function rateLimit(key: string, options?: { windowMs?: number; max?: number }): { ok: boolean; remaining: number; resetAt: number } {
  const windowMs = options?.windowMs ?? DEFAULTS.windowMs
  const max = options?.max ?? DEFAULTS.max

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count += 1

  if (entry.count > max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
