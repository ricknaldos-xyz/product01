'use client'

import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { Medal, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

export interface RankingEntry {
  rank: number
  userId: string
  displayName: string | null
  avatarUrl: string | null
  region: string | null
  city: string | null
  skillTier: SkillTier
  effectiveScore: number | null
  matchesPlayed: number
  previousRank: number | null
}

interface RankingTableProps {
  rankings: RankingEntry[]
  loading: boolean
}

function RankMovement({ rank, previousRank }: { rank: number; previousRank: number | null }) {
  if (previousRank === null || previousRank === rank) {
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  }

  if (previousRank > rank) {
    return (
      <span className="flex items-center gap-0.5 text-emerald-500">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{previousRank - rank}</span>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-0.5 text-red-500">
      <TrendingDown className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{rank - previousRank}</span>
    </span>
  )
}

export function RankingTable({ rankings, loading }: RankingTableProps) {
  if (loading) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando ranking...</span>
        </div>
      </GlassCard>
    )
  }

  if (rankings.length === 0) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm">No hay jugadores en este ranking</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard intensity="light" padding="none">
      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_auto_5rem_3rem] items-center gap-3 px-4 py-3 border-b border-glass text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="text-center">#</span>
        <span>Jugador</span>
        <span>Nivel</span>
        <span className="text-right">Puntaje</span>
        <span className="text-center">Mov.</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-glass-border-light">
        {rankings.map((player) => (
          <div
            key={player.userId}
            className="grid grid-cols-[3rem_1fr_auto_5rem_3rem] items-center gap-3 px-4 py-3 hover:bg-glass-light/50 transition-colors"
          >
            {/* Rank */}
            <div className="flex items-center justify-center">
              {player.rank <= 3 ? (
                <Medal
                  className={`h-5 w-5 ${
                    player.rank === 1
                      ? 'text-yellow-500'
                      : player.rank === 2
                        ? 'text-slate-400'
                        : 'text-amber-600'
                  }`}
                />
              ) : (
                <span className="text-sm font-bold text-muted-foreground tabular-nums">
                  {player.rank}
                </span>
              )}
            </div>

            {/* Player info */}
            <div className="flex items-center gap-3 min-w-0">
              {player.avatarUrl ? (
                <Image
                  src={player.avatarUrl}
                  alt={player.displayName || 'Jugador'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {(player.displayName || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {player.displayName || 'Jugador'}
                </p>
                {(player.city || player.region) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[player.city, player.region].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Tier */}
            <TierBadge tier={player.skillTier} size="sm" />

            {/* Score */}
            <span className="font-bold tabular-nums text-sm text-right">
              {player.effectiveScore?.toFixed(1) || '--'}
            </span>

            {/* Movement */}
            <div className="flex items-center justify-center">
              <RankMovement rank={player.rank} previousRank={player.previousRank} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
