import { describe, it, expect } from 'vitest'
import { validatePassword } from '@/lib/validation'

describe('validatePassword', () => {
  describe('valid passwords', () => {
    it('accepts "Password1" (meets all requirements)', () => {
      expect(validatePassword('Password1')).toBeNull()
    })

    it('accepts "Abcdef1g" (exactly 8 chars, has upper, lower, number)', () => {
      expect(validatePassword('Abcdef1g')).toBeNull()
    })

    it('accepts "MyP4sswd" (mixed case with number)', () => {
      expect(validatePassword('MyP4sswd')).toBeNull()
    })

    it('accepts "Test1234" (meets all requirements)', () => {
      expect(validatePassword('Test1234')).toBeNull()
    })

    it('accepts long password "SuperSecure123Password"', () => {
      expect(validatePassword('SuperSecure123Password')).toBeNull()
    })
  })

  describe('invalid passwords', () => {
    it('rejects too short password "Pass1"', () => {
      const result = validatePassword('Pass1')
      expect(result).not.toBeNull()
    })

    it('rejects password without uppercase "password1"', () => {
      const result = validatePassword('password1')
      expect(result).not.toBeNull()
    })

    it('rejects password without lowercase "PASSWORD1"', () => {
      const result = validatePassword('PASSWORD1')
      expect(result).not.toBeNull()
    })

    it('rejects password without number "Passwordd"', () => {
      const result = validatePassword('Passwordd')
      expect(result).not.toBeNull()
    })

    it('rejects empty string', () => {
      const result = validatePassword('')
      expect(result).not.toBeNull()
    })

    it('rejects 7-char password "Abcde1g"', () => {
      const result = validatePassword('Abcde1g')
      expect(result).not.toBeNull()
    })
  })

  describe('edge cases', () => {
    it('accepts exactly 8 characters with all requirements', () => {
      expect(validatePassword('Abcdef1g')).toBeNull()
    })

    it('rejects exactly 7 characters even with all other requirements', () => {
      const result = validatePassword('Abcde1g')
      expect(result).not.toBeNull()
    })
  })
})
