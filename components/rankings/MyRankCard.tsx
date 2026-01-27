'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { Trophy } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

interface MyRankCardProps {
  rank: number | null
  totalPlayers: number
  skillTier: SkillTier
  effectiveScore: number | null
}

export function MyRankCard({ rank, totalPlayers, skillTier, effectiveScore }: MyRankCardProps) {
  return (
    <GlassCard intensity="primary" padding="lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tu posicion
            </span>
            {rank !== null ? (
              <span className="text-4xl font-extrabold tabular-nums">
                #{rank}
              </span>
            ) : (
              <span className="text-4xl font-extrabold text-muted-foreground">--</span>
            )}
          </div>

          <div className="h-12 w-px bg-glass-border-light" />

          <div className="flex flex-col gap-1.5">
            <TierBadge tier={skillTier} size="md" />
            <span className="text-xs text-muted-foreground">
              de {totalPlayers.toLocaleString()} jugadores en Peru
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-2xl font-bold tabular-nums">
            {effectiveScore !== null ? effectiveScore.toFixed(1) : '--'}
          </span>
          <span className="text-xs text-muted-foreground">Puntaje</span>
        </div>
      </div>
    </GlassCard>
  )
}
