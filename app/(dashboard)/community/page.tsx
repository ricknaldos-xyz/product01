'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Users, Loader2, Trophy, Target, Flame, Medal, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { SkillTier, FeedItemType } from '@prisma/client'

interface FeedProfile {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  user: { name: string | null; image: string | null }
}

interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  description: string | null
  createdAt: string
  profile: FeedProfile
}

const feedIcons: Record<string, typeof Trophy> = {
  ANALYSIS_COMPLETED: Target,
  BADGE_EARNED: Medal,
  TIER_PROMOTION: Trophy,
  MATCH_PLAYED: Trophy,
  STREAK_MILESTONE: Flame,
  RANKING_MILESTONE: Medal,
}

export default function CommunityPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchFeed = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/social/feed?limit=30', { signal })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data.items)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchFeed(controller.signal)
    return () => controller.abort()
  }, [fetchFeed])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Comunidad</h1>
        </div>
        <GlassButton variant="outline" size="sm" asChild>
          <Link href="/community/clubs">Clubs</Link>
        </GlassButton>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-16">
          <GlassCard intensity="medium" padding="xl" className="max-w-md text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
            <h2 className="text-xl font-bold mb-2">Error al cargar</h2>
            <p className="text-muted-foreground mb-6">No se pudo cargar la informacion.</p>
            <GlassButton variant="solid" onClick={() => fetchFeed()}>
              Intentar de nuevo
            </GlassButton>
          </GlassCard>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">Tu feed esta vacio</p>
            <p className="text-sm text-muted-foreground mb-4">Sigue a otros jugadores para ver su actividad</p>
            <Link href="/rankings">
              <GlassButton variant="solid" size="sm">
                Explorar jugadores
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = feedIcons[item.type] || Target
            const playerName = item.profile.displayName || item.profile.user.name || 'Jugador'

            return (
              <GlassCard key={item.id} intensity="light" padding="md">
                <div className="flex items-start gap-4">
                  <Link href={`/player/${item.profile.userId}`} className="flex-shrink-0">
                    <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {item.profile.avatarUrl || item.profile.user.image ? (
                        <Image
                          src={item.profile.avatarUrl || item.profile.user.image || ''}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {playerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/player/${item.profile.userId}`} className="font-semibold text-sm hover:underline">
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
          })}
        </div>
      )}
    </div>
  )
}
