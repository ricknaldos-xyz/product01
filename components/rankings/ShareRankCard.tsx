'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'
import { getTierLabel } from '@/lib/skill-score'

interface ShareRankCardProps {
  rank: number | null
  displayName: string
  skillTier: SkillTier
  effectiveScore: number | null
}

export function ShareRankCard({ rank, displayName, skillTier, effectiveScore }: ShareRankCardProps) {
  const tierLabel = getTierLabel(skillTier)
  const shareText = rank !== null
    ? `Soy #${rank} en la categoria ${tierLabel} del ranking de tenis de Peru. Mi puntaje es ${effectiveScore?.toFixed(1) ?? '--'}. Unete y compite conmigo!`
    : `Estoy compitiendo en la categoria ${tierLabel} del ranking de tenis de Peru. Unete y compite conmigo!`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ranking de ${displayName}`,
          text: shareText,
          url: window.location.origin + '/rankings',
        })
      } catch (err) {
        // User cancelled share, ignore
        if ((err as Error).name !== 'AbortError') {
          fallbackCopy()
        }
      }
    } else {
      fallbackCopy()
    }
  }

  function fallbackCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Texto copiado al portapapeles')
    }).catch(() => {
      toast.error('No se pudo copiar el texto')
    })
  }

  return (
    <GlassCard intensity="medium" padding="lg" className="bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10">
      <div className="flex flex-col items-center text-center gap-3">
        {rank !== null ? (
          <span className="text-5xl font-extrabold tabular-nums">#{rank}</span>
        ) : (
          <span className="text-5xl font-extrabold text-muted-foreground">--</span>
        )}

        <p className="text-lg font-semibold">{displayName}</p>

        <TierBadge tier={skillTier} size="lg" />

        <span className="text-2xl font-bold tabular-nums">
          {effectiveScore !== null ? effectiveScore.toFixed(1) : '--'}
          <span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
        </span>

        <GlassButton variant="solid" size="default" onClick={handleShare} className="mt-2">
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </GlassButton>
      </div>
    </GlassCard>
  )
}
