import { describe, it, expect, vi, beforeEach } from 'vitest'

// Ensure in-memory fallback is used (no Redis)
vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')

// Mock the @upstash/ratelimit and @upstash/redis modules to avoid import errors
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow() { return {} }
  },
}))
vi.mock('@upstash/redis', () => ({
  Redis: class {},
}))

// Import after env stubs are set
const { authLimiter, registerLimiter, analyzeLimiter } = await import('@/lib/rate-limit')

describe('rate-limit (in-memory fallback)', () => {
  beforeEach(() => {
    // Clear the in-memory store by resetting module state is not practical,
    // so we use unique identifiers per test to avoid interference
  })

  describe('analyzeLimiter', () => {
    it('allows the first request', async () => {
      const result = await analyzeLimiter.check('analyze-first-' + Date.now())
      expect(result.success).toBe(true)
    })

    it('returns remaining count that decreases', async () => {
      const id = 'analyze-remaining-' + Date.now()
      const first = await analyzeLimiter.check(id)
      expect(first.remaining).toBe(9) // limit is 10, after 1 call => 9 remaining

      const second = await analyzeLimiter.check(id)
      expect(second.remaining).toBe(8)
    })

    it('rejects after exceeding the limit (10 per minute)', async () => {
      const id = 'analyze-limit-' + Date.now()

      // Use up all 10 allowed requests
      for (let i = 0; i < 10; i++) {
        const result = await analyzeLimiter.check(id)
        expect(result.success).toBe(true)
      }

      // 11th request should fail
      const result = await analyzeLimiter.check(id)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('does not interfere between different identifiers', async () => {
      const id1 = 'analyze-user1-' + Date.now()
      const id2 = 'analyze-user2-' + Date.now()

      // Exhaust id1
      for (let i = 0; i < 10; i++) {
        await analyzeLimiter.check(id1)
      }

      // id1 should be blocked
      const blocked = await analyzeLimiter.check(id1)
      expect(blocked.success).toBe(false)

      // id2 should still work
      const allowed = await analyzeLimiter.check(id2)
      expect(allowed.success).toBe(true)
    })
  })

  describe('authLimiter', () => {
    it('allows up to 5 requests', async () => {
      const id = 'auth-limit-' + Date.now()

      for (let i = 0; i < 5; i++) {
        const result = await authLimiter.check(id)
        expect(result.success).toBe(true)
      }

      const result = await authLimiter.check(id)
      expect(result.success).toBe(false)
    })
  })

  describe('registerLimiter', () => {
    it('allows up to 3 requests', async () => {
      const id = 'register-limit-' + Date.now()

      for (let i = 0; i < 3; i++) {
        const result = await registerLimiter.check(id)
        expect(result.success).toBe(true)
      }

      const result = await registerLimiter.check(id)
      expect(result.success).toBe(false)
    })
  })
})
