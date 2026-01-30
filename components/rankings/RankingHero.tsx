'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSport } from '@/contexts/SportContext'
import {
  getTierLabel,
  getNextTierThreshold,
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
  techniqueBreakdown?: { technique: { name: string; slug: string }; bestScore: number }[]
}

export function RankingHero() {
  const { activeSport } = useSport()
  const [data, setData] = useState<MyPositionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/rankings/my-position?sport=${activeSport?.slug || 'tennis'}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
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
      <GlassCard intensity="primary" padding="lg">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </GlassCard>
    )
  }

  if (!data) return null

  const isUnranked = data.skillTier === 'UNRANKED'

  if (isUnranked) {
    return (
      <GlassCard intensity="primary" padding="lg">
        <div className="text-center space-y-3 py-2">
          <p className="text-muted-foreground">
            Analiza 3+ tecnicas para obtener tu categoria
          </p>
          <Link href="/analyze">
            <GlassButton variant="solid">Analizar video</GlassButton>
          </Link>
        </div>
      </GlassCard>
    )
  }

  const nextTierInfo = getNextTierThreshold(data.skillTier)
  const currentScore = data.effectiveScore ?? 0
  const techniques = (data.techniqueBreakdown ?? []).slice(0, 5)

  // Progress bar calculation
  let progressPercent = 100
  let pointsToNext = 0
  if (nextTierInfo) {
    pointsToNext = Math.max(0, nextTierInfo.threshold - currentScore)
    // Find current tier threshold for range calculation
    const tierThresholds: Record<string, number> = {
      QUINTA_B: 0, QUINTA_A: 10, CUARTA_B: 20, CUARTA_A: 30,
      TERCERA_B: 40, TERCERA_A: 50, SEGUNDA_B: 60, SEGUNDA_A: 70,
      PRIMERA_B: 80, PRIMERA_A: 90,
    }
    const currentMin = tierThresholds[data.skillTier] ?? 0
    const range = nextTierInfo.threshold - currentMin
    progressPercent = range > 0 ? Math.min(100, ((currentScore - currentMin) / range) * 100) : 100
  }

  async function handleShare() {
    const text = `Soy #${data!.countryRank} en el ranking de SportTek Peru con ${data!.effectiveScore?.toFixed(1)} pts (${getTierLabel(data!.skillTier)})`
    if (navigator.share) {
      try {
        await navigator.share({ text, url: window.location.href })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} - ${window.location.href}`)
      toast.success('Copiado al portapapeles')
    }
  }

  return (
    <GlassCard intensity="primary" padding="lg">
      {/* Top section: position + score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Tu posicion</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-bold">
              #{data.countryRank || '--'}
            </span>
            <TierBadge tier={data.skillTier} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            de {data.totalInCountry} jugadores en Peru
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold tabular-nums">
            {data.effectiveScore?.toFixed(1) || '--'}
          </p>
        </div>
      </div>

      {/* Progress bar to next category */}
      {nextTierInfo && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-primary/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pointsToNext.toFixed(1)} pts para {getTierLabel(nextTierInfo.nextTier)}
          </p>
        </div>
      )}

      {/* Technique mini-badges */}
      {techniques.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {techniques.map((t) => {
            const tTier = getTechniqueTier(t.bestScore)
            return (
              <span
                key={t.technique.slug}
                className={`text-xs font-medium px-2 py-1 rounded-full bg-muted/50 ${getTechniqueTierColor(tTier)}`}
              >
                {t.technique.name} &middot; {getTechniqueTierLabel(tTier)}
              </span>
            )
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <Link href="/analyze" className="flex-1">
          <GlassButton variant="solid" className="w-full">
            Analizar video
          </GlassButton>
        </Link>
        <GlassButton variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </GlassButton>
      </div>
    </GlassCard>
  )
}
