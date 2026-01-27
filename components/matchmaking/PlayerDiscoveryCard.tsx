'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { MapPin, Send, Loader2 } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

interface PlayerDiscoveryCardProps {
  player: {
    userId: string
    displayName: string | null
    avatarUrl: string | null
    region: string | null
    city: string | null
    skillTier: SkillTier
    compositeScore: number | null
    matchesPlayed: number
    matchElo: number
    playStyle: string | null
    distance: number | null
  }
  onChallenge: (userId: string) => void
  loading: boolean
}

export function PlayerDiscoveryCard({ player, onChallenge, loading }: PlayerDiscoveryCardProps) {
  const name = player.displayName || 'Jugador'
  const initial = name.charAt(0).toUpperCase()

  return (
    <GlassCard intensity="light" padding="md" hover="lift">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary">{initial}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{name}</p>
            <TierBadge tier={player.skillTier} size="sm" />
          </div>
          <div className="flex flex-wrap gap-3 mt-1">
            {player.playStyle && (
              <span className="text-xs text-muted-foreground">{player.playStyle}</span>
            )}
            {player.distance !== null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {player.distance} km
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              ELO {player.matchElo} | {player.matchesPlayed} partidos
            </span>
          </div>
        </div>

        {/* Score + Challenge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-bold tabular-nums text-lg">
              {player.compositeScore?.toFixed(1) || '--'}
            </p>
          </div>
          <GlassButton
            variant="solid"
            size="sm"
            onClick={() => onChallenge(player.userId)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}
