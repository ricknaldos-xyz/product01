import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { SkillTier } from '@prisma/client'

const DEFAULT_WEIGHT = 0.6
const MIN_TECHNIQUES_FOR_RANKING = 3
const MAX_RECENT_ANALYSES = 3

// Tier thresholds (0-100 scale)
const TIER_THRESHOLDS: { min: number; tier: SkillTier }[] = [
  { min: 85, tier: 'DIAMANTE' },
  { min: 70, tier: 'PLATINO' },
  { min: 55, tier: 'ORO' },
  { min: 40, tier: 'PLATA' },
  { min: 0, tier: 'BRONCE' },
]

export function getTierFromScore(score: number | null): SkillTier {
  if (score === null) return 'UNRANKED'
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier
  }
  return 'BRONCE'
}

export function getTierColor(tier: SkillTier): string {
  switch (tier) {
    case 'DIAMANTE': return 'text-violet-500'
    case 'PLATINO': return 'text-cyan-500'
    case 'ORO': return 'text-yellow-500'
    case 'PLATA': return 'text-slate-400'
    case 'BRONCE': return 'text-amber-600'
    default: return 'text-muted-foreground'
  }
}

export function getTierLabel(tier: SkillTier): string {
  switch (tier) {
    case 'DIAMANTE': return 'Diamante'
    case 'PLATINO': return 'Platino'
    case 'ORO': return 'Oro'
    case 'PLATA': return 'Plata'
    case 'BRONCE': return 'Bronce'
    default: return 'Sin clasificar'
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
