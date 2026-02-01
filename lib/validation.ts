import { timingSafeEqual } from 'crypto'
import { z } from 'zod'

/**
 * Normalise an email address for storage/comparison.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Validate a password meets minimum requirements.
 * Returns an error message or null when valid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres'
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contrasena debe incluir al menos una letra mayuscula'
  }
  if (!/[a-z]/.test(password)) {
    return 'La contrasena debe incluir al menos una letra minuscula'
  }
  if (!/[0-9]/.test(password)) {
    return 'La contrasena debe incluir al menos un numero'
  }
  return null
}

/** Validate a dynamic route [id] param is a non-empty, safe string. */
export function validateId(id: string | undefined | null): id is string {
  if (!id || typeof id !== 'string') return false
  const trimmed = id.trim()
  return trimmed.length > 0 && trimmed.length <= 128
}

/** Extract a safe, user-facing message from a ZodError, never leaking schema internals. */
export function sanitizeZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos invalidos'
}

/** Constant-time string comparison to prevent timing attacks on secrets. */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) {
      // Still do a comparison to maintain constant time
      timingSafeEqual(bufA, bufA)
      return false
    }
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/** Bound a search string to a safe length. Returns trimmed string or null. */
export function sanitizeSearchString(search: string | null, maxLength = 100): string | null {
  if (!search) return null
  const trimmed = search.trim().slice(0, maxLength)
  return trimmed || null
}
