'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { Medal } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

interface PodiumPlayer {
  rank: number
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  effectiveScore: number | null
}

interface TopPodiumProps {
  players: PodiumPlayer[]
}

const MEDAL_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600']
const PEDESTAL_STYLES = [
  'h-20 bg-yellow-500/20',
  'h-14 bg-slate-400/20',
  'h-10 bg-amber-600/20',
]

export function TopPodium({ players }: TopPodiumProps) {
  if (players.length < 3) return null

  // Display order: #2, #1, #3
  const ordered = [players[1], players[0], players[2]]
  const orderIndices = [1, 0, 2]

  return (
    <GlassCard intensity="light" padding="md">
      <div className="grid grid-cols-3 gap-2 items-end pt-4">
        {ordered.map((player, displayIdx) => {
          const rankIdx = orderIndices[displayIdx]
          const avatarSize = rankIdx === 0 ? 56 : 44
          const isCenter = rankIdx === 0

          return (
            <Link
              key={player.userId}
              href={`/player/${player.userId}`}
              className="flex flex-col items-center text-center group"
            >
              {/* Medal */}
              <Medal className={`h-5 w-5 mb-1 ${MEDAL_COLORS[rankIdx]}`} />

              {/* Avatar */}
              <div
                className="relative rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 mb-2 ring-2 ring-offset-2 ring-offset-background"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderColor: rankIdx === 0 ? 'rgb(234 179 8)' : rankIdx === 1 ? 'rgb(148 163 184)' : 'rgb(217 119 6)',
                }}
              >
                {player.avatarUrl ? (
                  <Image
                    src={player.avatarUrl}
                    alt={player.displayName || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className={`font-bold text-primary ${isCenter ? 'text-lg' : 'text-sm'}`}>
                    {(player.displayName || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name */}
              <p className="text-xs font-medium truncate w-full max-w-[100px] group-hover:text-primary transition-colors">
                {player.displayName || 'Jugador'}
              </p>

              {/* Tier badge */}
              <TierBadge tier={player.skillTier} size="sm" />

              {/* Score */}
              <p className="text-sm font-bold tabular-nums mt-1">
                {player.effectiveScore?.toFixed(1) || '--'}
              </p>

              {/* Pedestal */}
              <div className={`w-full rounded-t-lg mt-2 ${PEDESTAL_STYLES[rankIdx]}`} />
            </Link>
          )
        })}
      </div>
    </GlassCard>
  )
}
