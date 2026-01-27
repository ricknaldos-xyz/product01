'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { Target, Medal, Trophy, Flame } from 'lucide-react'
import Link from 'next/link'
import type { SkillTier, FeedItemType } from '@prisma/client'

interface FeedCardProps {
  item: {
    id: string
    type: FeedItemType
    title: string
    description: string | null
    createdAt: string
    profile: {
      userId: string
      displayName: string | null
      avatarUrl: string | null
      skillTier: SkillTier
      user: { name: string | null; image: string | null }
    }
  }
}

const feedIconMap: Record<FeedItemType, typeof Trophy> = {
  ANALYSIS_COMPLETED: Target,
  BADGE_EARNED: Medal,
  TIER_PROMOTION: Trophy,
  MATCH_PLAYED: Trophy,
  STREAK_MILESTONE: Flame,
  RANKING_MILESTONE: Medal,
}

export function FeedCard({ item }: FeedCardProps) {
  const Icon = feedIconMap[item.type] || Target
  const playerName = item.profile.displayName || item.profile.user.name || 'Jugador'
  const avatar = item.profile.avatarUrl || item.profile.user.image

  return (
    <GlassCard intensity="light" padding="md">
      <div className="flex items-start gap-4">
        <Link href={`/player/${item.profile.userId}`} className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">
                {playerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/player/${item.profile.userId}`}
              className="font-semibold text-sm hover:underline"
            >
              {playerName}
            </Link>
            <TierBadge tier={item.profile.skillTier} size="sm" />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium">{item.title}</p>
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {new Date(item.createdAt).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
