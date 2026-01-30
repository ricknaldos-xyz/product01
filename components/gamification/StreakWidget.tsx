'use client'

import { useEffect, useState } from 'react'
import { Flame, Snowflake, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'

interface UserStreak {
  id: string
  currentStreak: number
  longestStreak: number
  lastActivityAt: string | null
  freezesAvailable: number
}

interface StreakWidgetProps {
  compact?: boolean
}

export function StreakWidget({ compact = false }: StreakWidgetProps) {
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAtRisk, setIsAtRisk] = useState(false)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch('/api/gamification/streak')
        if (response.ok) {
          const data = await response.json()
          setStreak(data)

          // Check if streak is at risk (no activity today and has a streak)
          if (data.lastActivityAt && data.currentStreak > 0) {
            const lastActivity = new Date(data.lastActivityAt)
            const today = new Date()
            lastActivity.setHours(0, 0, 0, 0)
            today.setHours(0, 0, 0, 0)

            if (lastActivity.getTime() < today.getTime()) {
              setIsAtRisk(true)
            }
          }
        }
      } catch (error) {
        logger.error('Failed to fetch streak:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [])

  if (loading) {
    return (
      <div
        className={cn(
          'glass-ultralight border-glass rounded-xl animate-pulse',
          compact ? 'h-10 w-20' : 'h-24 w-full'
        )}
      />
    )
  }

  if (!streak) {
    return null
  }

  if (compact) {
    return (
      <GlassBadge
        variant={isAtRisk ? 'warning' : streak.currentStreak > 0 ? 'primary' : 'default'}
        className="gap-2"
      >
        <Flame
          className={cn(
            'h-4 w-4',
            streak.currentStreak > 0 && 'animate-pulse'
          )}
        />
        <span className="font-semibold">{streak.currentStreak}</span>
      </GlassBadge>
    )
  }

  return (
    <GlassCard
      intensity={isAtRisk ? 'medium' : streak.currentStreak > 0 ? 'primary' : 'light'}
      padding="md"
      className={cn(
        isAtRisk && 'border-warning/30'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full border-glass flex items-center justify-center',
              isAtRisk
                ? 'bg-warning/20'
                : streak.currentStreak > 0
                ? 'glass-primary'
                : 'glass-ultralight'
            )}
          >
            <Flame
              className={cn(
                'h-6 w-6',
                isAtRisk
                  ? 'text-warning'
                  : streak.currentStreak > 0
                  ? 'text-primary animate-pulse'
                  : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Racha actual</p>
            <p className="text-2xl font-bold">
              {streak.currentStreak} {streak.currentStreak === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Mejor: {streak.longestStreak}</span>
          </div>
          {streak.freezesAvailable > 0 && (
            <GlassBadge variant="default" className="text-blue-600">
              <Snowflake className="h-3 w-3 mr-1" />
              {streak.freezesAvailable} freeze
            </GlassBadge>
          )}
        </div>
      </div>

      {isAtRisk && (
        <p className="text-sm text-warning mt-3">
          Tu racha esta en riesgo. Completa una actividad hoy para mantenerla.
        </p>
      )}
    </GlassCard>
  )
}
