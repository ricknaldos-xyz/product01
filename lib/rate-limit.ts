import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

// In-memory fallback for development only
interface RateLimitEntry {
  count: number
  resetAt: number
}

const inMemoryStore = new Map<string, RateLimitEntry>()

function createInMemoryLimiter(prefix: string, limit: number, windowSec: number) {
  return {
    async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
      const key = `${prefix}:${identifier}`
      const now = Date.now()
      const entry = inMemoryStore.get(key)

      if (!entry || now > entry.resetAt) {
        inMemoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 })
        return { success: true, remaining: limit - 1 }
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 }
      }

      entry.count++
      return { success: true, remaining: limit - entry.count }
    },
  }
}

function createUpstashLimiter(prefix: string, limit: number, windowSec: number) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: `ratelimit:${prefix}`,
  })

  return {
    async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
      const result = await limiter.limit(identifier)
      return { success: result.success, remaining: result.remaining }
    },
  }
}

const isProduction = process.env.NODE_ENV === 'production'

function rateLimit(options: {
  key: string
  limit: number
  window: number // seconds
}) {
  const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

  if (hasRedis) {
    return createUpstashLimiter(options.key, options.limit, options.window)
  }

  if (isProduction) {
    logger.warn(
      `Rate limiter "${options.key}" using in-memory fallback in production. ` +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed rate limiting.'
    )
  }

  return createInMemoryLimiter(options.key, options.limit, options.window)
}

// Pre-configured limiters
export const authLimiter = rateLimit({ key: 'auth', limit: 5, window: 60 })          // 5 per minute
export const registerLimiter = rateLimit({ key: 'register', limit: 3, window: 60 })   // 3 per minute
export const forgotPasswordLimiter = rateLimit({ key: 'forgot', limit: 3, window: 300 }) // 3 per 5 min
export const analyzeLimiter = rateLimit({ key: 'analyze', limit: 10, window: 60 })     // 10 per minute
export const reportLimiter = rateLimit({ key: 'report', limit: 5, window: 300 })       // 5 per 5 min
export const uploadLimiter = rateLimit({ key: 'upload', limit: 10, window: 60 })       // 10 per minute
export const checkoutLimiter = rateLimit({ key: 'checkout', limit: 5, window: 60 })     // 5 per minute
export const tournamentLimiter = rateLimit({ key: 'tournament', limit: 5, window: 60 }) // 5 per minute
export const challengeLimiter = rateLimit({ key: 'challenge', limit: 10, window: 60 })  // 10 per minute
