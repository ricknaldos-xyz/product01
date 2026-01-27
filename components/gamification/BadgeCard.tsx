'use client'

import { cn } from '@/lib/utils'
import { BadgeDefinition } from '@/lib/badges'
import { formatDate } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'

interface BadgeCardProps {
  badge: BadgeDefinition
  earnedAt?: Date | string
  isLocked?: boolean
}

export function BadgeCard({ badge, earnedAt, isLocked = false }: BadgeCardProps) {
  return (
    <GlassCard
      intensity={isLocked ? 'ultralight' : 'light'}
      padding="md"
      hover={isLocked ? 'none' : 'scale'}
      className={cn(
        'relative text-center',
        isLocked && 'opacity-50 grayscale'
      )}
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h3 className="font-semibold text-sm">{badge.name}</h3>
      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
      {earnedAt && !isLocked && (
        <p className="text-xs text-muted-foreground mt-2">
          {formatDate(new Date(earnedAt))}
        </p>
      )}

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl glass-ultralight">
          <div className="text-2xl">🔒</div>
        </div>
      )}
    </GlassCard>
  )
}
