import { describe, it, expect } from 'vitest'
import { getTierFromScore, getTierColor, getTierLabel } from '@/lib/skill-score'

describe('getTierFromScore', () => {
  it('returns UNRANKED for null score', () => {
    expect(getTierFromScore(null)).toBe('UNRANKED')
  })

  it('returns QUINTA_B for score 0-9', () => {
    expect(getTierFromScore(0)).toBe('QUINTA_B')
    expect(getTierFromScore(5)).toBe('QUINTA_B')
  })

  it('returns QUINTA_A for score 10-19', () => {
    expect(getTierFromScore(10)).toBe('QUINTA_A')
    expect(getTierFromScore(15)).toBe('QUINTA_A')
  })

  it('returns CUARTA_B for score 20-29', () => {
    expect(getTierFromScore(20)).toBe('CUARTA_B')
  })

  it('returns CUARTA_A for score 30-39', () => {
    expect(getTierFromScore(30)).toBe('CUARTA_A')
  })

  it('returns TERCERA_B for score 40-49', () => {
    expect(getTierFromScore(40)).toBe('TERCERA_B')
  })

  it('returns TERCERA_A for score 50-59', () => {
    expect(getTierFromScore(50)).toBe('TERCERA_A')
  })

  it('returns SEGUNDA_B for score 60-69', () => {
    expect(getTierFromScore(60)).toBe('SEGUNDA_B')
  })

  it('returns SEGUNDA_A for score 70-79', () => {
    expect(getTierFromScore(70)).toBe('SEGUNDA_A')
  })

  it('returns PRIMERA_B for score 80-89', () => {
    expect(getTierFromScore(80)).toBe('PRIMERA_B')
  })

  it('returns PRIMERA_A for score 90+', () => {
    expect(getTierFromScore(90)).toBe('PRIMERA_A')
    expect(getTierFromScore(100)).toBe('PRIMERA_A')
  })

  // Boundary tests
  it('returns PRIMERA_A at exactly 90', () => {
    expect(getTierFromScore(90)).toBe('PRIMERA_A')
  })

  it('returns PRIMERA_B at exactly 80', () => {
    expect(getTierFromScore(80)).toBe('PRIMERA_B')
  })

  it('returns PRIMERA_B at exactly 89', () => {
    expect(getTierFromScore(89)).toBe('PRIMERA_B')
  })

  it('returns SEGUNDA_A at exactly 70', () => {
    expect(getTierFromScore(70)).toBe('SEGUNDA_A')
  })

  it('returns SEGUNDA_B at exactly 60', () => {
    expect(getTierFromScore(60)).toBe('SEGUNDA_B')
  })

  it('returns TERCERA_A at exactly 50', () => {
    expect(getTierFromScore(50)).toBe('TERCERA_A')
  })

  it('returns TERCERA_B at exactly 40', () => {
    expect(getTierFromScore(40)).toBe('TERCERA_B')
  })

  it('returns CUARTA_A at exactly 30', () => {
    expect(getTierFromScore(30)).toBe('CUARTA_A')
  })

  it('returns CUARTA_B at exactly 20', () => {
    expect(getTierFromScore(20)).toBe('CUARTA_B')
  })

  it('returns QUINTA_A at exactly 10', () => {
    expect(getTierFromScore(10)).toBe('QUINTA_A')
  })

  it('returns QUINTA_B at exactly 0', () => {
    expect(getTierFromScore(0)).toBe('QUINTA_B')
  })

  it('returns QUINTA_B at exactly 9', () => {
    expect(getTierFromScore(9)).toBe('QUINTA_B')
  })

  it('returns QUINTA_B for negative scores', () => {
    expect(getTierFromScore(-5)).toBe('QUINTA_B')
  })
})

describe('getTierColor', () => {
  it('returns violet-600 for PRIMERA_A', () => {
    expect(getTierColor('PRIMERA_A')).toBe('text-violet-600')
  })

  it('returns violet-500 for PRIMERA_B', () => {
    expect(getTierColor('PRIMERA_B')).toBe('text-violet-500')
  })

  it('returns emerald-500 for TERCERA_B', () => {
    expect(getTierColor('TERCERA_B')).toBe('text-emerald-500')
  })

  it('returns amber-500 for QUINTA_B', () => {
    expect(getTierColor('QUINTA_B')).toBe('text-amber-500')
  })

  it('returns muted foreground for UNRANKED', () => {
    expect(getTierColor('UNRANKED')).toBe('text-muted-foreground')
  })
})

describe('getTierLabel', () => {
  it('returns 1ra A for PRIMERA_A', () => {
    expect(getTierLabel('PRIMERA_A')).toBe('1ra A')
  })

  it('returns 1ra B for PRIMERA_B', () => {
    expect(getTierLabel('PRIMERA_B')).toBe('1ra B')
  })

  it('returns 3ra B for TERCERA_B', () => {
    expect(getTierLabel('TERCERA_B')).toBe('3ra B')
  })

  it('returns 5ta B for QUINTA_B', () => {
    expect(getTierLabel('QUINTA_B')).toBe('5ta B')
  })

  it('returns Sin clasificar for UNRANKED', () => {
    expect(getTierLabel('UNRANKED')).toBe('Sin clasificar')
  })
})
