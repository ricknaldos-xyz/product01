'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { Trophy } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

interface Participant {
  profileId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  effectiveScore: number | null
  seed: number | null
  eliminated: boolean
  finalPosition: number | null
  userName: string | null
}

interface ParticipantListProps {
  participants: Participant[]
}

export function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <GlassCard intensity="light" padding="lg">
        <p className="text-center text-muted-foreground text-sm">
          No hay participantes inscritos
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard intensity="light" padding="md">
      <div className="divide-y divide-glass">
        {participants.map((p) => (
          <div
            key={p.profileId}
            className={`flex items-center gap-3 py-3 px-2 ${
              p.eliminated ? 'opacity-50' : ''
            }`}
          >
            {/* Seed */}
            <span className="text-xs text-muted-foreground w-6 text-right font-mono">
              {p.seed ?? '-'}
            </span>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt={p.displayName || 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {(p.displayName || p.userName || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + Tier */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className={`font-medium text-sm truncate ${
                  p.eliminated ? 'line-through' : ''
                }`}
              >
                {p.displayName || p.userName || 'Jugador'}
              </span>
              <TierBadge tier={p.skillTier} size="sm" />
            </div>

            {/* Score */}
            {p.effectiveScore != null && (
              <span className="text-xs text-muted-foreground">
                {p.effectiveScore.toFixed(0)} pts
              </span>
            )}

            {/* Winner icon */}
            {p.finalPosition === 1 && (
              <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
