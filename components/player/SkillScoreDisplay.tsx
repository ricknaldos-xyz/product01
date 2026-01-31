'use client'

import { cn } from '@/lib/utils'
import { TierBadge } from './TierBadge'
import { MIN_TECHNIQUES_FOR_RANKING } from '@/lib/skill-score'
import type { SkillTier } from '@prisma/client'

interface SkillScoreDisplayProps {
  score: number | null
  tier: SkillTier
  className?: string
  techniquesAnalyzed?: number
}

export function SkillScoreDisplay({ score, tier, className, techniquesAnalyzed }: SkillScoreDisplayProps) {
  if (score === null || tier === 'UNRANKED') {
    return (
      <div className={cn('text-center', className)}>
        <div className="text-4xl font-bold text-muted-foreground">--</div>
        <TierBadge tier="UNRANKED" size="sm" className="mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {techniquesAnalyzed && techniquesAnalyzed > 0
            ? `${techniquesAnalyzed}/${MIN_TECHNIQUES_FOR_RANKING} tecnicas analizadas`
            : `Analiza ${MIN_TECHNIQUES_FOR_RANKING}+ tecnicas para obtener tu score`}
        </p>
      </div>
    )
  }

  const tierColors: Record<string, string> = {
    QUINTA_B: 'text-amber-500',
    QUINTA_A: 'text-amber-600',
    CUARTA_B: 'text-yellow-500',
    CUARTA_A: 'text-yellow-600',
    TERCERA_B: 'text-emerald-500',
    TERCERA_A: 'text-emerald-600',
    SEGUNDA_B: 'text-cyan-500',
    SEGUNDA_A: 'text-cyan-600',
    PRIMERA_B: 'text-violet-500',
    PRIMERA_A: 'text-violet-600',
  }

  return (
    <div className={cn('text-center', className)}>
      <div className={cn('text-5xl font-bold tabular-nums', tierColors[tier] || 'text-foreground')}>
        {score.toFixed(1)}
      </div>
      <TierBadge tier={tier} size="md" className="mt-2" />
    </div>
  )
}
