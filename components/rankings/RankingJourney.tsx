'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Target, TrendingUp, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import {
  MIN_TECHNIQUES_FOR_RANKING,
  getTierLabel,
} from '@/lib/skill-score'
import { useSport } from '@/contexts/SportContext'
import type { SkillTier } from '@prisma/client'

interface RankingJourneyProps {
  techniqueBreakdown: { technique: { name: string; slug: string }; bestScore: number }[]
  skillTier: SkillTier
  variant: 'full' | 'compact'
}

const RECOMMENDED_TECHNIQUES = [
  { slug: 'saque', name: 'Saque' },
  { slug: 'derecha', name: 'Derecha' },
  { slug: 'reves', name: 'Reves' },
]

export function RankingJourney({ techniqueBreakdown, skillTier, variant }: RankingJourneyProps) {
  const { activeSport } = useSport()
  const sportSlug = activeSport?.slug || 'tennis'
  const [celebrated, setCelebrated] = useState(true) // default true to avoid flash

  const analyzedCount = techniqueBreakdown.length
  const isRanked = skillTier !== 'UNRANKED'

  useEffect(() => {
    if (isRanked) {
      const key = `sporttek-ranked-celebrated-${sportSlug}`
      const alreadyCelebrated = localStorage.getItem(key) === 'true'
      if (!alreadyCelebrated) {
        setCelebrated(false)
        localStorage.setItem(key, 'true')
      } else {
        setCelebrated(true)
      }
    }
  }, [isRanked, sportSlug])

  // --- Compact variant ---
  if (variant === 'compact') {
    if (isRanked) return null

    return (
      <div className="flex items-center gap-3">
        {Array.from({ length: MIN_TECHNIQUES_FOR_RANKING }, (_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${
              i < analyzedCount ? 'bg-emerald-500' : 'bg-muted/40'
            }`}
          />
        ))}
        <span className="text-sm">{analyzedCount}/{MIN_TECHNIQUES_FOR_RANKING} tecnicas</span>
        <Link href="/analyze">
          <GlassButton variant="solid" size="sm">
            Analizar
          </GlassButton>
        </Link>
      </div>
    )
  }

  // --- Full variant, ranked ---
  if (isRanked) {
    // Celebration for first-time ranking
    if (!celebrated) {
      return (
        <GlassCard intensity="primary" padding="lg">
          <div className="text-center space-y-4">
            <Sparkles className="h-8 w-8 text-yellow-500 mx-auto" />
            <p className="text-xl font-bold">Felicidades!</p>
            <TierBadge tier={skillTier} size="lg" />
            <p className="text-sm text-muted-foreground">
              Tu categoria es {getTierLabel(skillTier)}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/rankings">
                <GlassButton variant="solid">Ver mi posicion</GlassButton>
              </Link>
              <Link href="/analyze">
                <GlassButton variant="outline">Seguir mejorando</GlassButton>
              </Link>
            </div>
          </div>
        </GlassCard>
      )
    }

    // Already celebrated — nothing to show
    return null
  }

  // --- Full variant, 0 techniques analyzed ---
  if (analyzedCount === 0) {
    return (
      <GlassCard intensity="primary" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5" />
          <span className="text-lg font-semibold">Obtene tu Categoria</span>
        </div>

        {/* Visual stepper */}
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: MIN_TECHNIQUES_FOR_RANKING }, (_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full border-2 border-muted/40 flex items-center justify-center text-sm text-muted-foreground">
                  {i + 1}
                </div>
                <span className="text-xs text-muted-foreground mt-1">Tecnica {i + 1}</span>
              </div>
              {i < MIN_TECHNIQUES_FOR_RANKING - 1 && <div className="h-0.5 flex-1 bg-muted/30 mx-2" />}
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Analiza {MIN_TECHNIQUES_FOR_RANKING} tecnicas diferentes para recibir tu categoria y aparecer en el ranking
        </p>

        <p className="text-sm font-medium mt-4 mb-3">Tecnicas recomendadas para empezar:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RECOMMENDED_TECHNIQUES.map((t) => (
            <GlassCard key={t.slug} intensity="light" padding="md" hover="lift">
              <p className="font-medium text-sm mb-2">{t.name}</p>
              <Link href="/analyze">
                <GlassButton variant="solid" size="sm">
                  Analizar
                </GlassButton>
              </Link>
            </GlassCard>
          ))}
        </div>

        <Link href="/analyze" className="block mt-4">
          <GlassButton variant="solid" className="w-full">
            Analizar mi primera tecnica
          </GlassButton>
        </Link>
      </GlassCard>
    )
  }

  // --- Full variant, 1-4 techniques analyzed ---
  const analyzedSlugs = techniqueBreakdown.map((t) => t.technique.slug)
  const remaining = MIN_TECHNIQUES_FOR_RANKING - analyzedCount

  // Find next suggested technique
  const nextSuggested =
    RECOMMENDED_TECHNIQUES.find((t) => !analyzedSlugs.includes(t.slug)) ||
    { slug: 'tecnica', name: 'Siguiente tecnica' }

  return (
    <GlassCard intensity="primary" padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <span className="text-lg font-semibold">Tu progreso hacia tu categoria</span>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="h-2.5 rounded-full bg-primary/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(analyzedCount / MIN_TECHNIQUES_FOR_RANKING) * 100}%` }}
          />
        </div>
      </div>
      <p className="text-sm font-medium mb-4">{analyzedCount}/{MIN_TECHNIQUES_FOR_RANKING} tecnicas analizadas</p>

      {/* Visual stepper */}
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: MIN_TECHNIQUES_FOR_RANKING }, (_, i) => {
          const analyzed = techniqueBreakdown[i]
          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {analyzed ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {analyzed.technique.name}
                    </span>
                    <span className="text-xs font-medium">
                      {analyzed.bestScore.toFixed(0)}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full border-2 border-muted/40 flex items-center justify-center text-sm text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Tecnica {i + 1}</span>
                  </>
                )}
              </div>
              {i < MIN_TECHNIQUES_FOR_RANKING - 1 && <div className="h-0.5 flex-1 bg-muted/30 mx-2" />}
            </div>
          )
        })}
      </div>

      {/* Next suggestion */}
      <p className="text-sm font-medium mb-2">Siguiente tecnica sugerida:</p>
      <GlassCard intensity="light" padding="md" hover="lift" className="mb-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{nextSuggested.name}</p>
          <Link href="/analyze">
            <GlassButton variant="solid" size="sm">
              Analizar {nextSuggested.name}
              <ArrowRight className="h-4 w-4 ml-1" />
            </GlassButton>
          </Link>
        </div>
      </GlassCard>

      <p className="text-sm text-muted-foreground">
        Te falta {remaining} tecnica{remaining > 1 ? 's' : ''} para obtener tu categoria!
      </p>
    </GlassCard>
  )
}
