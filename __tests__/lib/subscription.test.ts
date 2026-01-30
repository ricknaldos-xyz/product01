import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before importing the module under test
vi.mock('@/lib/prisma', () => ({
  prisma: {
    analysis: {
      count: vi.fn(),
    },
    trainingPlan: {
      count: vi.fn(),
    },
    improvementGoal: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import {
  getPlanLimits,
  checkAnalysisLimit,
  checkActivePlansLimit,
  checkActiveGoalsLimit,
} from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

const mockAnalysisCount = vi.mocked(prisma.analysis.count)
const mockTrainingPlanCount = vi.mocked(prisma.trainingPlan.count)
const mockGoalCount = vi.mocked(prisma.improvementGoal.count)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPlanLimits', () => {
  it('returns FREE limits for FREE subscription', () => {
    const limits = getPlanLimits('FREE')
    expect(limits).toEqual({
      analysesPerMonth: 3,
      activePlans: 1,
    })
  })

  it('returns PRO limits for PRO subscription', () => {
    const limits = getPlanLimits('PRO')
    expect(limits).toEqual({
      analysesPerMonth: -1,
      activePlans: -1,
    })
  })

  it('returns ELITE limits for ELITE subscription', () => {
    const limits = getPlanLimits('ELITE')
    expect(limits).toEqual({
      analysesPerMonth: -1,
      activePlans: -1,
    })
  })

  it('falls back to FREE limits for unknown subscription', () => {
    const limits = getPlanLimits('UNKNOWN')
    expect(limits).toEqual({
      analysesPerMonth: 3,
      activePlans: 1,
    })
  })

  it('falls back to FREE limits for empty string', () => {
    const limits = getPlanLimits('')
    expect(limits).toEqual({
      analysesPerMonth: 3,
      activePlans: 1,
    })
  })
})

describe('checkAnalysisLimit', () => {
  it('returns allowed when under the FREE limit', async () => {
    mockAnalysisCount.mockResolvedValue(1 as never)

    const result = await checkAnalysisLimit('user1', 'FREE')
    expect(result.allowed).toBe(true)
  })

  it('returns not allowed when at the FREE limit', async () => {
    mockAnalysisCount.mockResolvedValue(3 as never)

    const result = await checkAnalysisLimit('user1', 'FREE')
    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.limit).toBe(3)
      expect(result.current).toBe(3)
    }
  })

  it('returns not allowed when over the FREE limit', async () => {
    mockAnalysisCount.mockResolvedValue(5 as never)

    const result = await checkAnalysisLimit('user1', 'FREE')
    expect(result.allowed).toBe(false)
  })

  it('always returns allowed for PRO (unlimited)', async () => {
    // Should not even call prisma.analysis.count for unlimited plans
    const result = await checkAnalysisLimit('user1', 'PRO')
    expect(result.allowed).toBe(true)
    expect(mockAnalysisCount).not.toHaveBeenCalled()
  })

  it('always returns allowed for ELITE (unlimited)', async () => {
    const result = await checkAnalysisLimit('user1', 'ELITE')
    expect(result.allowed).toBe(true)
    expect(mockAnalysisCount).not.toHaveBeenCalled()
  })

  it('uses FREE limits for unknown subscription', async () => {
    mockAnalysisCount.mockResolvedValue(3 as never)

    const result = await checkAnalysisLimit('user1', 'GARBAGE')
    expect(result.allowed).toBe(false)
  })
})

describe('checkActivePlansLimit', () => {
  it('returns allowed when under FREE active plans limit', async () => {
    mockTrainingPlanCount.mockResolvedValue(0 as never)

    const result = await checkActivePlansLimit('user1', 'FREE')
    expect(result.allowed).toBe(true)
  })

  it('returns not allowed when at FREE active plans limit', async () => {
    mockTrainingPlanCount.mockResolvedValue(1 as never)

    const result = await checkActivePlansLimit('user1', 'FREE')
    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.limit).toBe(1)
      expect(result.current).toBe(1)
    }
  })

  it('always returns allowed for PRO (unlimited)', async () => {
    const result = await checkActivePlansLimit('user1', 'PRO')
    expect(result.allowed).toBe(true)
    expect(mockTrainingPlanCount).not.toHaveBeenCalled()
  })

  it('always returns allowed for ELITE (unlimited)', async () => {
    const result = await checkActivePlansLimit('user1', 'ELITE')
    expect(result.allowed).toBe(true)
    expect(mockTrainingPlanCount).not.toHaveBeenCalled()
  })
})

describe('checkActiveGoalsLimit', () => {
  it('returns allowed when under FREE goals limit (3)', async () => {
    mockGoalCount.mockResolvedValue(2 as never)

    const result = await checkActiveGoalsLimit('user1', 'FREE')
    expect(result.allowed).toBe(true)
  })

  it('returns not allowed when at FREE goals limit (3)', async () => {
    mockGoalCount.mockResolvedValue(3 as never)

    const result = await checkActiveGoalsLimit('user1', 'FREE')
    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.limit).toBe(3)
      expect(result.current).toBe(3)
    }
  })

  it('returns not allowed when over FREE goals limit', async () => {
    mockGoalCount.mockResolvedValue(5 as never)

    const result = await checkActiveGoalsLimit('user1', 'FREE')
    expect(result.allowed).toBe(false)
  })

  it('always returns allowed for PRO (unlimited)', async () => {
    const result = await checkActiveGoalsLimit('user1', 'PRO')
    expect(result.allowed).toBe(true)
    expect(mockGoalCount).not.toHaveBeenCalled()
  })

  it('always returns allowed for ELITE (unlimited)', async () => {
    const result = await checkActiveGoalsLimit('user1', 'ELITE')
    expect(result.allowed).toBe(true)
    expect(mockGoalCount).not.toHaveBeenCalled()
  })
})
