import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  normalizeEmail,
  validatePassword,
  validateId,
  sanitizeZodError,
  timingSafeCompare,
  sanitizeSearchString,
} from '@/lib/validation'

describe('normalizeEmail', () => {
  it('lowercases the email', () => {
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('handles already normalized email', () => {
    expect(normalizeEmail('user@example.com')).toBe('user@example.com')
  })

  it('handles mixed case and whitespace', () => {
    expect(normalizeEmail(' Test@Gmail.Com ')).toBe('test@gmail.com')
  })
})

describe('validatePassword', () => {
  it('returns null for valid password (meets all requirements)', () => {
    expect(validatePassword('Password1')).toBeNull()
    expect(validatePassword('A very l0ng password')).toBeNull()
  })

  it('returns error message for short password', () => {
    expect(validatePassword('1234567')).toBe('La contrasena debe tener al menos 8 caracteres')
    expect(validatePassword('')).toBe('La contrasena debe tener al menos 8 caracteres')
    expect(validatePassword('abc')).toBe('La contrasena debe tener al menos 8 caracteres')
  })

  it('exactly 8 characters with all requirements is valid', () => {
    expect(validatePassword('Abcdef1g')).toBeNull()
  })
})

describe('validateId', () => {
  it('returns false for null', () => {
    expect(validateId(null)).toBe(false)
  })
  it('returns false for undefined', () => {
    expect(validateId(undefined)).toBe(false)
  })
  it('returns false for empty string', () => {
    expect(validateId('')).toBe(false)
  })
  it('returns false for whitespace only', () => {
    expect(validateId('   ')).toBe(false)
  })
  it('returns false for string over 128 chars', () => {
    expect(validateId('a'.repeat(129))).toBe(false)
  })
  it('returns true for valid CUID', () => {
    expect(validateId('clx123abc')).toBe(true)
  })
  it('returns true for UUID', () => {
    expect(validateId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })
})

describe('sanitizeZodError', () => {
  it('returns first issue message', () => {
    const schema = z.object({ name: z.string(), age: z.number() })
    const result = schema.safeParse({ name: 123, age: 'bad' })
    if (!result.success) {
      const msg = sanitizeZodError(result.error)
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
    }
  })
  it('returns fallback for empty issues', () => {
    const error = new z.ZodError([])
    expect(sanitizeZodError(error)).toBe('Datos invalidos')
  })
})

describe('timingSafeCompare', () => {
  it('returns true for matching strings', () => {
    expect(timingSafeCompare('secret123', 'secret123')).toBe(true)
  })
  it('returns false for different strings', () => {
    expect(timingSafeCompare('secret123', 'wrong456')).toBe(false)
  })
  it('returns false for different lengths', () => {
    expect(timingSafeCompare('short', 'muchlonger')).toBe(false)
  })
  it('returns false for empty vs non-empty', () => {
    expect(timingSafeCompare('', 'something')).toBe(false)
  })
})

describe('sanitizeSearchString', () => {
  it('returns null for null input', () => {
    expect(sanitizeSearchString(null)).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(sanitizeSearchString('')).toBeNull()
  })
  it('returns null for whitespace only', () => {
    expect(sanitizeSearchString('   ')).toBeNull()
  })
  it('trims whitespace', () => {
    expect(sanitizeSearchString('  hello  ')).toBe('hello')
  })
  it('truncates to maxLength', () => {
    expect(sanitizeSearchString('a'.repeat(200), 100)).toBe('a'.repeat(100))
  })
  it('uses custom maxLength', () => {
    expect(sanitizeSearchString('abcdef', 3)).toBe('abc')
  })
})
