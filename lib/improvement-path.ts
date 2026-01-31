import type { SkillTier } from '@prisma/client'
import { getNextTierThreshold, getTierLabel } from '@/lib/skill-score'

// Types
export interface TechniqueBreakdownItem {
  technique: { name: string; slug: string }
  bestScore: number
  lastAnalyzedAt?: string | null
}

export interface ImprovementRecommendation {
  slug: string
  name: string
  currentScore: number
  potentialImpact: number
  daysSinceAnalysis: number | null
  suggestReEvaluation: boolean
  reason: string
}

export interface ImprovementSummary {
  pointsToNextTier: number
  nextTierLabel: string
  nextTier: SkillTier | null
  recommendations: ImprovementRecommendation[]
  summaryMessage: string
}

// Constants
const MIN_DAYS_BEFORE_REEVALUATION = 14
const STALE_ANALYSIS_DAYS = 45

// Core function
export function computeImprovementPath(
  compositeScore: number,
  skillTier: SkillTier,
  techniqueBreakdown: TechniqueBreakdownItem[],
): ImprovementSummary {
  const nextTierInfo = getNextTierThreshold(skillTier)
  const pointsToNextTier = nextTierInfo
    ? Math.max(0, nextTierInfo.threshold - compositeScore)
    : 0
  const nextTierLabel = nextTierInfo ? getTierLabel(nextTierInfo.nextTier) : 'Maximo nivel'

  // Sort techniques by score ascending (weakest first)
  const sorted = [...techniqueBreakdown].sort((a, b) => a.bestScore - b.bestScore)

  const now = new Date()
  const avgScore = techniqueBreakdown.length > 0
    ? techniqueBreakdown.reduce((s, x) => s + x.bestScore, 0) / techniqueBreakdown.length
    : 0

  const recommendations: ImprovementRecommendation[] = sorted.map((t) => {
    const daysSince = t.lastAnalyzedAt
      ? Math.floor((now.getTime() - new Date(t.lastAnalyzedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const potentialImpact = Math.max(0, avgScore - t.bestScore)
    const suggestReEvaluation = daysSince !== null && daysSince >= MIN_DAYS_BEFORE_REEVALUATION

    let reason: string
    if (t.bestScore < 30) {
      reason = `Tu ${t.technique.name} necesita trabajo fundamental. Es tu mayor area de oportunidad.`
    } else if (t.bestScore < 50) {
      reason = `Mejorar tu ${t.technique.name} tendra el mayor impacto en tu score general.`
    } else if (potentialImpact > 10) {
      reason = `Tu ${t.technique.name} esta por debajo de tu promedio. Nivelarla subira tu ranking.`
    } else {
      reason = `Tu ${t.technique.name} esta bien. Afinar detalles te acercara al siguiente nivel.`
    }

    return {
      slug: t.technique.slug,
      name: t.technique.name,
      currentScore: t.bestScore,
      potentialImpact,
      daysSinceAnalysis: daysSince,
      suggestReEvaluation,
      reason,
    }
  })

  let summaryMessage: string
  if (!nextTierInfo) {
    summaryMessage = 'Estas en el maximo nivel. Manten tu rendimiento analizando regularmente.'
  } else if (pointsToNextTier <= 2) {
    summaryMessage = `Estas muy cerca de ${nextTierLabel}! Mejora cualquier tecnica para subir.`
  } else if (pointsToNextTier <= 5) {
    summaryMessage = `Te faltan ${pointsToNextTier.toFixed(1)} pts para ${nextTierLabel}. Enfocate en ${recommendations[0]?.name ?? 'tu tecnica mas debil'}.`
  } else {
    summaryMessage = `Para llegar a ${nextTierLabel}, enfocate en mejorar ${recommendations[0]?.name ?? 'tus tecnicas mas debiles'}.`
  }

  return {
    pointsToNextTier,
    nextTierLabel,
    nextTier: nextTierInfo?.nextTier ?? null,
    recommendations,
    summaryMessage,
  }
}

export function getReEvalMessage(daysSince: number | null): string {
  if (daysSince === null) return 'Sin analisis previo'
  if (daysSince < MIN_DAYS_BEFORE_REEVALUATION) {
    const remaining = MIN_DAYS_BEFORE_REEVALUATION - daysSince
    return `Espera ${remaining} dia${remaining !== 1 ? 's' : ''} mas para re-evaluar`
  }
  if (daysSince < STALE_ANALYSIS_DAYS) {
    return 'Listo para re-evaluar'
  }
  return 'Re-evaluacion recomendada'
}

export function getReEvalStatus(daysSince: number | null): 'wait' | 'ready' | 'recommended' {
  if (daysSince === null) return 'recommended'
  if (daysSince < MIN_DAYS_BEFORE_REEVALUATION) return 'wait'
  if (daysSince < STALE_ANALYSIS_DAYS) return 'ready'
  return 'recommended'
}
