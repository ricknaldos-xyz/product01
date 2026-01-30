'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { BadgeCard } from '@/components/gamification/BadgeCard'
import { BadgeDefinition } from '@/lib/badges'
import { BadgeType } from '@prisma/client'
import { Award, ChevronRight } from 'lucide-react'
import { logger } from '@/lib/logger'

interface UserBadge {
  id: string
  badgeType: BadgeType
  earnedAt: string
  definition: BadgeDefinition
}

export function RecentBadgesCard() {
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      try {
        // Check for new badges
        await fetch('/api/gamification/badges', { method: 'POST' })

        // Fetch all badges
        const response = await fetch('/api/gamification/badges')
        if (response.ok) {
          const data = await response.json()
          setBadges(data.slice(0, 4)) // Only show recent 4
        }
      } catch (error) {
        logger.error('Failed to fetch badges:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [])

  if (loading) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 glass-ultralight rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 glass-ultralight rounded-xl" />
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  if (badges.length === 0) {
    return (
      <GlassCard intensity="light" padding="lg" className="text-center">
        <div className="glass-ultralight border-glass rounded-2xl p-3 w-fit mx-auto mb-3">
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">Gana tu primer badge</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Completa actividades para desbloquear badges
        </p>
        <GlassButton variant="outline" asChild>
          <Link href="/analyze">Empezar</Link>
        </GlassButton>
      </GlassCard>
    )
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Mis Badges
        </h2>
        <GlassButton variant="ghost" size="sm" asChild>
          <Link href="/profile/badges">
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge.definition}
            earnedAt={badge.earnedAt}
          />
        ))}
      </div>
    </GlassCard>
  )
}
