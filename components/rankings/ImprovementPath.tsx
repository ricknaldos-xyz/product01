'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Target, Dumbbell, ArrowRight, Clock, RefreshCw, Loader2 } from 'lucide-react'
import { useSport } from '@/contexts/SportContext'
import {
  computeImprovementPath,
  getReEvalMessage,
  getReEvalStatus,
} from '@/lib/improvement-path'
import {
  getTechniqueTier,
  getTechniqueTierLabel,
  getTechniqueTierColor,
} from '@/lib/skill-score'
import type { SkillTier } from '@prisma/client'

interface MyPositionData {
  compositeScore: number | null
  effectiveScore: number | null
  skillTier: SkillTier
  countryRank: number | null
  totalInCountry: number
  totalInTier: number
  techniqueBreakdown?: { technique: { name: string; slug: string }; bestScore: number; lastAnalyzedAt?: string | null }[]
}

export function ImprovementPath() {
  const { activeSport } = useSport()
  const [data, setData] = useState<MyPositionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/rankings/my-position?sport=${activeSport?.slug || 'tennis'}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
        // User might not have a profile
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeSport?.slug])

  if (loading) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </GlassCard>
    )
  }

  if (!data || data.skillTier === 'UNRANKED') return null

  const techniqueBreakdown = data.techniqueBreakdown ?? []
  const path = computeImprovementPath(
    data.compositeScore ?? 0,
    data.skillTier,
    techniqueBreakdown,
  )

  return (
    <GlassCard intensity="light" padding="lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Tu camino a {path.nextTierLabel}</h3>
        {path.nextTier && <TierBadge tier={path.nextTier} size="sm" />}
      </div>
      {path.nextTier ? (
        <p className="text-sm text-muted-foreground mb-4">{path.summaryMessage}</p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">Estas en el maximo nivel. Manten tu rendimiento analizando regularmente.</p>
      )}

      {/* Technique priority list */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridad de mejora</p>
        {path.recommendations.map((rec) => {
          const tTier = getTechniqueTier(rec.currentScore)
          const reEvalStatus = getReEvalStatus(rec.daysSinceAnalysis)
          const reEvalMsg = getReEvalMessage(rec.daysSinceAnalysis)

          return (
            <div key={rec.slug} className="glass-ultralight rounded-xl p-3">
              {/* Top row: name + score + tier */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{rec.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tabular-nums">{rec.currentScore.toFixed(1)}</span>
                  <span className={`text-xs font-medium ${getTechniqueTierColor(tTier)}`}>
                    {getTechniqueTierLabel(tTier)}
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${rec.currentScore}%` }}
                />
              </div>

              {/* Re-eval status + action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {reEvalStatus === 'wait' && <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                  {reEvalStatus === 'ready' && <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />}
                  {reEvalStatus === 'recommended' && <RefreshCw className="h-3.5 w-3.5 text-amber-500" />}
                  <span className={`text-xs ${
                    reEvalStatus === 'wait' ? 'text-muted-foreground' :
                    reEvalStatus === 'ready' ? 'text-emerald-500' :
                    'text-amber-500'
                  }`}>
                    {reEvalMsg}
                  </span>
                </div>
                {reEvalStatus !== 'wait' && (
                  <Link href={`/analyze`}>
                    <GlassButton variant="ghost" size="sm" className="h-7 text-xs">
                      Re-evaluar
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </GlassButton>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mt-4">
        <Link href="/training" className="flex-1">
          <GlassButton variant="outline" className="w-full" size="sm">
            <Dumbbell className="h-4 w-4 mr-2" />
            Entrenar
          </GlassButton>
        </Link>
        <Link href="/goals" className="flex-1">
          <GlassButton variant="outline" className="w-full" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Crear objetivo
          </GlassButton>
        </Link>
      </div>
    </GlassCard>
  )
}
