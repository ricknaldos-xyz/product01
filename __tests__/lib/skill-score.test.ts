import { describe, it, expect } from 'vitest'
import { getTierFromScore, getTierColor, getTierLabel } from '@/lib/skill-score'

describe('getTierFromScore', () => {
  it('returns UNRANKED for null score', () => {
    expect(getTierFromScore(null)).toBe('UNRANKED')
  })

  it('returns DIAMANTE for score >= 85', () => {
    expect(getTierFromScore(100)).toBe('DIAMANTE')
    expect(getTierFromScore(90)).toBe('DIAMANTE')
  })

  it('returns PLATINO for score 70-84', () => {
    expect(getTierFromScore(75)).toBe('PLATINO')
    expect(getTierFromScore(80)).toBe('PLATINO')
  })

  it('returns ORO for score 55-69', () => {
    expect(getTierFromScore(60)).toBe('ORO')
    expect(getTierFromScore(65)).toBe('ORO')
  })

  it('returns PLATA for score 40-54', () => {
    expect(getTierFromScore(45)).toBe('PLATA')
    expect(getTierFromScore(50)).toBe('PLATA')
  })

  it('returns BRONCE for score 0-39', () => {
    expect(getTierFromScore(10)).toBe('BRONCE')
    expect(getTierFromScore(30)).toBe('BRONCE')
  })

  // Boundary tests
  it('returns DIAMANTE at exactly 85', () => {
    expect(getTierFromScore(85)).toBe('DIAMANTE')
  })

  it('returns PLATINO at exactly 70', () => {
    expect(getTierFromScore(70)).toBe('PLATINO')
  })

  it('returns PLATINO at exactly 84', () => {
    expect(getTierFromScore(84)).toBe('PLATINO')
  })

  it('returns ORO at exactly 55', () => {
    expect(getTierFromScore(55)).toBe('ORO')
  })

  it('returns ORO at exactly 69', () => {
    expect(getTierFromScore(69)).toBe('ORO')
  })

  it('returns PLATA at exactly 40', () => {
    expect(getTierFromScore(40)).toBe('PLATA')
  })

  it('returns BRONCE at exactly 0', () => {
    expect(getTierFromScore(0)).toBe('BRONCE')
  })

  it('returns BRONCE at exactly 39', () => {
    expect(getTierFromScore(39)).toBe('BRONCE')
  })

  it('returns BRONCE for negative scores', () => {
    expect(getTierFromScore(-5)).toBe('BRONCE')
  })
})

describe('getTierColor', () => {
  it('returns violet for DIAMANTE', () => {
    expect(getTierColor('DIAMANTE')).toBe('text-violet-500')
  })

  it('returns cyan for PLATINO', () => {
    expect(getTierColor('PLATINO')).toBe('text-cyan-500')
  })

  it('returns yellow for ORO', () => {
    expect(getTierColor('ORO')).toBe('text-yellow-500')
  })

  it('returns slate for PLATA', () => {
    expect(getTierColor('PLATA')).toBe('text-slate-400')
  })

  it('returns amber for BRONCE', () => {
    expect(getTierColor('BRONCE')).toBe('text-amber-600')
  })

  it('returns muted foreground for UNRANKED', () => {
    expect(getTierColor('UNRANKED')).toBe('text-muted-foreground')
  })
})

describe('getTierLabel', () => {
  it('returns Diamante for DIAMANTE', () => {
    expect(getTierLabel('DIAMANTE')).toBe('Diamante')
  })

  it('returns Platino for PLATINO', () => {
    expect(getTierLabel('PLATINO')).toBe('Platino')
  })

  it('returns Oro for ORO', () => {
    expect(getTierLabel('ORO')).toBe('Oro')
  })

  it('returns Plata for PLATA', () => {
    expect(getTierLabel('PLATA')).toBe('Plata')
  })

  it('returns Bronce for BRONCE', () => {
    expect(getTierLabel('BRONCE')).toBe('Bronce')
  })

  it('returns Sin clasificar for UNRANKED', () => {
    expect(getTierLabel('UNRANKED')).toBe('Sin clasificar')
  })
})
