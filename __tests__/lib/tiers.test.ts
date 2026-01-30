import { describe, it, expect } from 'vitest'
import { isPlayerTierAllowed, TIER_ORDER } from '@/lib/tiers'

describe('TIER_ORDER', () => {
  it('contains 10 tiers in ascending order', () => {
    expect(TIER_ORDER).toEqual([
      'QUINTA_B', 'QUINTA_A', 'CUARTA_B', 'CUARTA_A',
      'TERCERA_B', 'TERCERA_A', 'SEGUNDA_B', 'SEGUNDA_A',
      'PRIMERA_B', 'PRIMERA_A',
    ])
  })

  it('starts with QUINTA_B and ends with PRIMERA_A', () => {
    expect(TIER_ORDER[0]).toBe('QUINTA_B')
    expect(TIER_ORDER[TIER_ORDER.length - 1]).toBe('PRIMERA_A')
  })

  it('has exactly 10 entries', () => {
    expect(TIER_ORDER).toHaveLength(10)
  })
})

describe('isPlayerTierAllowed', () => {
  it('allows TERCERA_A when no restrictions are set', () => {
    expect(isPlayerTierAllowed('TERCERA_A')).toBe(true)
  })

  it('rejects CUARTA_A when min is TERCERA_B (CUARTA_A is below TERCERA_B)', () => {
    expect(isPlayerTierAllowed('CUARTA_A', 'TERCERA_B')).toBe(false)
  })

  it('allows SEGUNDA_A within min TERCERA_B and max PRIMERA_A', () => {
    expect(isPlayerTierAllowed('SEGUNDA_A', 'TERCERA_B', 'PRIMERA_A')).toBe(true)
  })

  it('rejects PRIMERA_A when max is SEGUNDA_A (PRIMERA_A is above SEGUNDA_A)', () => {
    expect(isPlayerTierAllowed('PRIMERA_A', null, 'SEGUNDA_A')).toBe(false)
  })

  it('rejects unknown tier', () => {
    expect(isPlayerTierAllowed('UNKNOWN', 'QUINTA_B', 'PRIMERA_A')).toBe(false)
    expect(isPlayerTierAllowed('')).toBe(false)
  })

  it('allows QUINTA_B with no constraints', () => {
    expect(isPlayerTierAllowed('QUINTA_B')).toBe(true)
  })

  it('allows player when no restrictions are set', () => {
    expect(isPlayerTierAllowed('PRIMERA_A')).toBe(true)
    expect(isPlayerTierAllowed('QUINTA_A', null, null)).toBe(true)
    expect(isPlayerTierAllowed('CUARTA_B', undefined, undefined)).toBe(true)
  })

  it('allows player within min/max range', () => {
    expect(isPlayerTierAllowed('TERCERA_A', 'CUARTA_A', 'SEGUNDA_B')).toBe(true)
  })

  it('allows player at exact min boundary', () => {
    expect(isPlayerTierAllowed('CUARTA_A', 'CUARTA_A', 'PRIMERA_A')).toBe(true)
  })

  it('allows player at exact max boundary', () => {
    expect(isPlayerTierAllowed('SEGUNDA_B', 'QUINTA_B', 'SEGUNDA_B')).toBe(true)
  })

  it('rejects player below minimum tier', () => {
    expect(isPlayerTierAllowed('QUINTA_B', 'CUARTA_A', 'PRIMERA_A')).toBe(false)
  })

  it('rejects player above maximum tier', () => {
    expect(isPlayerTierAllowed('PRIMERA_A', 'QUINTA_B', 'SEGUNDA_B')).toBe(false)
  })

  it('allows player when only minTier is set and player meets it', () => {
    expect(isPlayerTierAllowed('TERCERA_A', 'CUARTA_A')).toBe(true)
    expect(isPlayerTierAllowed('CUARTA_A', 'CUARTA_A')).toBe(true)
  })

  it('rejects player when only minTier is set and player is below', () => {
    expect(isPlayerTierAllowed('QUINTA_B', 'TERCERA_A')).toBe(false)
  })

  it('allows player when only maxTier is set and player meets it', () => {
    expect(isPlayerTierAllowed('CUARTA_A', null, 'TERCERA_A')).toBe(true)
    expect(isPlayerTierAllowed('TERCERA_A', null, 'TERCERA_A')).toBe(true)
  })

  it('rejects player when only maxTier is set and player exceeds it', () => {
    expect(isPlayerTierAllowed('PRIMERA_A', null, 'SEGUNDA_B')).toBe(false)
  })

  it('handles single-tier range (min == max)', () => {
    expect(isPlayerTierAllowed('TERCERA_A', 'TERCERA_A', 'TERCERA_A')).toBe(true)
    expect(isPlayerTierAllowed('CUARTA_A', 'TERCERA_A', 'TERCERA_A')).toBe(false)
    expect(isPlayerTierAllowed('SEGUNDA_B', 'TERCERA_A', 'TERCERA_A')).toBe(false)
  })
})
