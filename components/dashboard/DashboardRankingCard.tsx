'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { RankingJourney } from '@/components/rankings/RankingJourney'
import { Trophy } from 'lucide-react'
import { useSport } from '@/contexts/SportContext'
import { computeImprovementPath, type TechniqueBreakdownItem } from '@/lib/improvement-path'
import { getNextTierThreshold, getTierLabel } from '@/lib/skill-score'
import type { SkillTier } from '@prisma/client'

interface PositionData {
  compositeScore: number | null
  effectiveScore: number | null
  skillTier: SkillTier
  countryRank: number | null
  totalInCountry: number
  techniqueBreakdown?: { technique: { name: string; slug: string }; bestScore: number; lastAnalyzedAt?: string | null }[]
}

export function DashboardRankingCard() {
  const { activeSport } = useSport()
  const [data, setData] = useState<PositionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch_data() {
      setLoading(true)
      try {
        const res = await fetch(`/api/rankings/my-position?sport=${activeSport?.slug || 'tennis'}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
        // No profile
      } finally {
        setLoading(false)
      }
    }
    fetch_data()
  }, [activeSport?.slug])

  if (loading) return null // Don't show loading state to keep dashboard clean
  if (!data) return null

  const isUnranked = data.skillTier === 'UNRANKED'

  if (isUnranked) {
    return (
      <RankingJourney
        techniqueBreakdown={data.techniqueBreakdown ?? []}
        skillTier={data.skillTier}
        variant="compact"
      />
    )
  }

  // Ranked: show compact position card
  return (
    <Link href="/rankings">
      <GlassCard intensity="light" padding="md" hover="lift" className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-primary border-glass rounded-xl p-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Ranking Peru</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold">#{data.countryRank || '--'}</span>
                <TierBadge tier={data.skillTier} size="sm" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">
              {data.effectiveScore?.toFixed(1) || '--'}
            </p>
            <p className="text-xs text-muted-foreground">pts</p>
          </div>
        </div>
        {data.techniqueBreakdown && data.techniqueBreakdown.length > 0 && (() => {
          const path = computeImprovementPath(
            data.compositeScore ?? 0,
            data.skillTier,
            data.techniqueBreakdown ?? [],
          )
          const weakest = path.recommendations[0]
          if (!weakest || !path.nextTier) return null
          return (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-glass">
              Mejora tu {weakest.name} para subir a {path.nextTierLabel}
            </p>
          )
        })()}
      </GlassCard>
    </Link>
  )
}
