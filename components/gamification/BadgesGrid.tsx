'use client'

import { useEffect, useState } from 'react'
import { BadgeCard } from './BadgeCard'
import { BADGE_DEFINITIONS, BadgeDefinition } from '@/lib/badges'
import { BadgeType } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface UserBadge {
  id: string
  badgeType: BadgeType
  earnedAt: string
  definition: BadgeDefinition
}

export function BadgesGrid() {
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch('/api/gamification/badges')
        if (response.ok) {
          const data = await response.json()
          setBadges(data)
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const earnedTypes = new Set(badges.map((b) => b.badgeType))
  const allBadgeTypes = Object.keys(BADGE_DEFINITIONS) as BadgeType[]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Mis Badges</h2>
        <span className="text-sm text-muted-foreground">
          {badges.length}/{allBadgeTypes.length} desbloqueados
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allBadgeTypes.map((type) => {
          const earnedBadge = badges.find((b) => b.badgeType === type)
          const definition = BADGE_DEFINITIONS[type]

          return (
            <BadgeCard
              key={type}
              badge={definition}
              earnedAt={earnedBadge?.earnedAt}
              isLocked={!earnedTypes.has(type)}
            />
          )
        })}
      </div>
    </div>
  )
}
