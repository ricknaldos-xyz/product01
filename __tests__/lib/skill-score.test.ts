import { describe, it, expect } from 'vitest'
import { getTierFromScore, getTierColor, getTierLabel, getTechniqueTier, getTechniqueTierLabel, getTechniqueTierColor, getCategoryGroup, getNextTierThreshold } from '@/lib/skill-score'

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

describe('getTechniqueTier', () => {
  it('returns DIAMANTE for score >= 85', () => {
    expect(getTechniqueTier(85)).toBe('DIAMANTE')
    expect(getTechniqueTier(100)).toBe('DIAMANTE')
  })

  it('returns PLATINO for score 70-84', () => {
    expect(getTechniqueTier(70)).toBe('PLATINO')
    expect(getTechniqueTier(84)).toBe('PLATINO')
  })

  it('returns ORO for score 55-69', () => {
    expect(getTechniqueTier(55)).toBe('ORO')
    expect(getTechniqueTier(69)).toBe('ORO')
  })

  it('returns PLATA for score 40-54', () => {
    expect(getTechniqueTier(40)).toBe('PLATA')
    expect(getTechniqueTier(54)).toBe('PLATA')
  })

  it('returns BRONCE for score < 40', () => {
    expect(getTechniqueTier(0)).toBe('BRONCE')
    expect(getTechniqueTier(39)).toBe('BRONCE')
  })
})

describe('getTechniqueTierLabel', () => {
  it('returns correct labels', () => {
    expect(getTechniqueTierLabel('DIAMANTE')).toBe('Diamante')
    expect(getTechniqueTierLabel('PLATINO')).toBe('Platino')
    expect(getTechniqueTierLabel('ORO')).toBe('Oro')
    expect(getTechniqueTierLabel('PLATA')).toBe('Plata')
    expect(getTechniqueTierLabel('BRONCE')).toBe('Bronce')
  })
})

describe('getTechniqueTierColor', () => {
  it('returns correct colors', () => {
    expect(getTechniqueTierColor('DIAMANTE')).toBe('text-violet-500')
    expect(getTechniqueTierColor('PLATINO')).toBe('text-cyan-500')
    expect(getTechniqueTierColor('ORO')).toBe('text-yellow-500')
    expect(getTechniqueTierColor('PLATA')).toBe('text-slate-400')
    expect(getTechniqueTierColor('BRONCE')).toBe('text-amber-600')
  })
})

describe('getCategoryGroup', () => {
  it('returns correct category groups', () => {
    expect(getCategoryGroup('PRIMERA_A')).toBe('1ra')
    expect(getCategoryGroup('PRIMERA_B')).toBe('1ra')
    expect(getCategoryGroup('SEGUNDA_A')).toBe('2da')
    expect(getCategoryGroup('SEGUNDA_B')).toBe('2da')
    expect(getCategoryGroup('TERCERA_A')).toBe('3ra')
    expect(getCategoryGroup('TERCERA_B')).toBe('3ra')
    expect(getCategoryGroup('CUARTA_A')).toBe('4ta')
    expect(getCategoryGroup('CUARTA_B')).toBe('4ta')
    expect(getCategoryGroup('QUINTA_A')).toBe('5ta')
    expect(getCategoryGroup('QUINTA_B')).toBe('5ta')
    expect(getCategoryGroup('UNRANKED')).toBe('')
  })
})

describe('getNextTierThreshold', () => {
  it('returns next tier for QUINTA_B', () => {
    const result = getNextTierThreshold('QUINTA_B')
    expect(result).toEqual({ nextTier: 'QUINTA_A', threshold: 10 })
  })

  it('returns next tier for CUARTA_A', () => {
    const result = getNextTierThreshold('CUARTA_A')
    expect(result).toEqual({ nextTier: 'TERCERA_B', threshold: 40 })
  })

  it('returns null for PRIMERA_A (top tier)', () => {
    expect(getNextTierThreshold('PRIMERA_A')).toBeNull()
  })
})
