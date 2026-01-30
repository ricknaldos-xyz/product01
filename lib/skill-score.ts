import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { SkillTier } from '@prisma/client'

const DEFAULT_WEIGHT = 0.6
const MIN_TECHNIQUES_FOR_RANKING = 3
const MAX_RECENT_ANALYSES = 3

// Category thresholds (0-100 scale) — Peruvian tennis categories
const TIER_THRESHOLDS: { min: number; tier: SkillTier }[] = [
  { min: 90, tier: 'PRIMERA_A' },
  { min: 80, tier: 'PRIMERA_B' },
  { min: 70, tier: 'SEGUNDA_A' },
  { min: 60, tier: 'SEGUNDA_B' },
  { min: 50, tier: 'TERCERA_A' },
  { min: 40, tier: 'TERCERA_B' },
  { min: 30, tier: 'CUARTA_A' },
  { min: 20, tier: 'CUARTA_B' },
  { min: 10, tier: 'QUINTA_A' },
  { min: 0, tier: 'QUINTA_B' },
]

export function getTierFromScore(score: number | null): SkillTier {
  if (score === null) return 'UNRANKED'
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier
  }
  return 'QUINTA_B'
}

export function getTierColor(tier: SkillTier): string {
  switch (tier) {
    case 'PRIMERA_A': return 'text-violet-600'
    case 'PRIMERA_B': return 'text-violet-500'
    case 'SEGUNDA_A': return 'text-cyan-600'
    case 'SEGUNDA_B': return 'text-cyan-500'
    case 'TERCERA_A': return 'text-emerald-600'
    case 'TERCERA_B': return 'text-emerald-500'
    case 'CUARTA_A': return 'text-yellow-600'
    case 'CUARTA_B': return 'text-yellow-500'
    case 'QUINTA_A': return 'text-amber-600'
    case 'QUINTA_B': return 'text-amber-500'
    default: return 'text-muted-foreground'
  }
}

export function getTierLabel(tier: SkillTier): string {
  switch (tier) {
    case 'PRIMERA_A': return '1ra A'
    case 'PRIMERA_B': return '1ra B'
    case 'SEGUNDA_A': return '2da A'
    case 'SEGUNDA_B': return '2da B'
    case 'TERCERA_A': return '3ra A'
    case 'TERCERA_B': return '3ra B'
    case 'CUARTA_A': return '4ta A'
    case 'CUARTA_B': return '4ta B'
    case 'QUINTA_A': return '5ta A'
    case 'QUINTA_B': return '5ta B'
    default: return 'Sin clasificar'
  }
}

/** Returns the category group name (1ra, 2da, 3ra, 4ta, 5ta) for a tier */
export function getCategoryGroup(tier: SkillTier): string {
  if (tier === 'PRIMERA_A' || tier === 'PRIMERA_B') return '1ra'
  if (tier === 'SEGUNDA_A' || tier === 'SEGUNDA_B') return '2da'
  if (tier === 'TERCERA_A' || tier === 'TERCERA_B') return '3ra'
  if (tier === 'CUARTA_A' || tier === 'CUARTA_B') return '4ta'
  if (tier === 'QUINTA_A' || tier === 'QUINTA_B') return '5ta'
  return ''
}

/** Returns the score threshold for the next tier above the given tier */
export function getNextTierThreshold(tier: SkillTier): { nextTier: SkillTier; threshold: number } | null {
  const idx = TIER_THRESHOLDS.findIndex((t) => t.tier === tier)
  if (idx <= 0) return null // Already at top or not found
  return { nextTier: TIER_THRESHOLDS[idx - 1].tier, threshold: TIER_THRESHOLDS[idx - 1].min }
}

// --- Technique-level badges (gamification layer, display-only) ---

export type TechniqueTier = 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO' | 'DIAMANTE'

const TECHNIQUE_TIER_THRESHOLDS: { min: number; tier: TechniqueTier }[] = [
  { min: 85, tier: 'DIAMANTE' },
  { min: 70, tier: 'PLATINO' },
  { min: 55, tier: 'ORO' },
  { min: 40, tier: 'PLATA' },
  { min: 0, tier: 'BRONCE' },
]

export function getTechniqueTier(score: number): TechniqueTier {
  for (const { min, tier } of TECHNIQUE_TIER_THRESHOLDS) {
    if (score >= min) return tier
  }
  return 'BRONCE'
}

export function getTechniqueTierLabel(tier: TechniqueTier): string {
  switch (tier) {
    case 'DIAMANTE': return 'Diamante'
    case 'PLATINO': return 'Platino'
    case 'ORO': return 'Oro'
    case 'PLATA': return 'Plata'
    case 'BRONCE': return 'Bronce'
  }
}

export function getTechniqueTierColor(tier: TechniqueTier): string {
  switch (tier) {
    case 'DIAMANTE': return 'text-violet-500'
    case 'PLATINO': return 'text-cyan-500'
    case 'ORO': return 'text-yellow-500'
    case 'PLATA': return 'text-slate-400'
    case 'BRONCE': return 'text-amber-600'
  }
}

/**
 * Recalculates the composite skill score for a user.
 * Called after every completed analysis.
 *
 * Scores are computed per-sport and stored in SportProfile.
 * PlayerProfile is also updated with the best sport's score for backwards compatibility.
 *
 * Algorithm:
 * 1. For each technique analyzed, get the best score from the last 3 analyses
 * 2. Read technique weights from DB (Technique.weight)
 * 3. Compute weighted average across techniques
 * 4. Require at least 3 different techniques for a ranked score
 * 5. Update SportProfile and PlayerProfile
 */
export async function recalculateSkillScore(userId: string): Promise<void> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
  })

  if (!profile) return

  // Get all sports the user has analyses for
  const userSports = await prisma.analysis.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      overallScore: { not: null },
    },
    select: {
      technique: {
        select: { sportId: true },
      },
    },
    distinct: ['techniqueId'],
  })

  const sportIds = [...new Set(userSports.map((a) => a.technique.sportId))]

  let bestCompositeScore: number | null = null
  let bestSkillTier: SkillTier = 'UNRANKED'
  let totalAnalysesAll = 0
  let totalTechniquesAll = 0

  for (const sportId of sportIds) {
    // Ensure SportProfile exists
    const sportProfile = await prisma.sportProfile.upsert({
      where: {
        profileId_sportId: {
          profileId: profile.id,
          sportId,
        },
      },
      create: {
        profileId: profile.id,
        sportId,
      },
      update: {},
    })

    // Get completed analyses for this user + sport
    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        overallScore: { not: null },
        technique: { sportId },
      },
      select: {
        id: true,
        techniqueId: true,
        overallScore: true,
        createdAt: true,
        technique: {
          select: { slug: true, weight: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by technique and take best of last N
    const techniqueMap = new Map<string, {
      techniqueId: string
      slug: string
      weight: number
      scores: number[]
      lastAnalysisId: string
      lastAnalyzedAt: Date
    }>()

    for (const analysis of analyses) {
      const existing = techniqueMap.get(analysis.techniqueId)
      if (existing) {
        if (existing.scores.length < MAX_RECENT_ANALYSES) {
          existing.scores.push(analysis.overallScore! * 10) // Convert 0-10 to 0-100
        }
      } else {
        techniqueMap.set(analysis.techniqueId, {
          techniqueId: analysis.techniqueId,
          slug: analysis.technique.slug,
          weight: analysis.technique.weight,
          scores: [analysis.overallScore! * 10],
          lastAnalysisId: analysis.id,
          lastAnalyzedAt: analysis.createdAt,
        })
      }
    }

    // Update TechniqueScore records (linked to both profile and sportProfile)
    const techniqueScoreUpserts = Array.from(techniqueMap.entries()).map(
      ([techniqueId, data]) => {
        const bestScore = Math.max(...data.scores)
        const averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length

        return prisma.techniqueScore.upsert({
          where: {
            profileId_techniqueId: {
              profileId: profile.id,
              techniqueId,
            },
          },
          create: {
            profileId: profile.id,
            sportProfileId: sportProfile.id,
            techniqueId,
            bestScore,
            averageScore,
            analysisCount: data.scores.length,
            lastAnalysisId: data.lastAnalysisId,
            lastAnalyzedAt: data.lastAnalyzedAt,
            scoreHistory: data.scores.map((s, i) => ({ index: i, score: s })),
          },
          update: {
            sportProfileId: sportProfile.id,
            bestScore,
            averageScore,
            analysisCount: data.scores.length,
            lastAnalysisId: data.lastAnalysisId,
            lastAnalyzedAt: data.lastAnalyzedAt,
            scoreHistory: data.scores.map((s, i) => ({ index: i, score: s })),
          },
        })
      }
    )

    await Promise.all(techniqueScoreUpserts)

    // Calculate composite score for this sport
    const totalTechniques = techniqueMap.size
    let compositeScore: number | null = null
    let skillTier: SkillTier = 'UNRANKED'

    if (totalTechniques >= MIN_TECHNIQUES_FOR_RANKING) {
      let weightedSum = 0
      let totalWeight = 0

      for (const [, data] of techniqueMap) {
        const weight = data.weight ?? DEFAULT_WEIGHT
        const bestScore = Math.max(...data.scores)
        weightedSum += weight * bestScore
        totalWeight += weight
      }

      compositeScore = totalWeight > 0 ? weightedSum / totalWeight : null
      skillTier = getTierFromScore(compositeScore)
    }

    const totalAnalyses = analyses.length
    const previousTier = sportProfile.skillTier

    // Update SportProfile
    await prisma.sportProfile.update({
      where: { id: sportProfile.id },
      data: {
        compositeScore,
        effectiveScore: compositeScore,
        skillTier,
        totalAnalyses,
        totalTechniques,
        lastScoreUpdate: new Date(),
      },
    })

    // Track best sport for PlayerProfile
    totalAnalysesAll += totalAnalyses
    totalTechniquesAll += totalTechniques
    if (compositeScore !== null && (bestCompositeScore === null || compositeScore > bestCompositeScore)) {
      bestCompositeScore = compositeScore
      bestSkillTier = skillTier
    }

    if (previousTier !== skillTier && skillTier !== 'UNRANKED') {
      logger.info(
        `User ${userId} sport ${sportId} promoted from ${previousTier} to ${skillTier} (score: ${compositeScore?.toFixed(1)})`
      )
    }
  }

  // Update PlayerProfile with best sport's score (backwards compatibility)
  await prisma.playerProfile.update({
    where: { id: profile.id },
    data: {
      compositeScore: bestCompositeScore,
      effectiveScore: bestCompositeScore,
      skillTier: bestSkillTier,
      totalAnalyses: totalAnalysesAll,
      totalTechniques: totalTechniquesAll,
      lastScoreUpdate: new Date(),
    },
  })
}
