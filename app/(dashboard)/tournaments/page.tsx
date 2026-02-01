'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/date-utils'
import { Trophy, Calendar, MapPin, Users, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  format: string
  maxPlayers: number
  status: string
  registrationEnd: string
  startDate: string
  venue: string | null
  city: string | null
  organizer: { displayName: string | null; avatarUrl: string | null }
  _count: { participants: number }
}

const statusLabels: Record<string, string> = {
  REGISTRATION: 'Inscripcion abierta',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

const statusVariant: Record<string, 'warning' | 'success' | 'destructive' | 'primary' | 'default'> = {
  REGISTRATION: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function fetchTournaments() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ country: 'PE' })
        if (tab) params.set('status', tab)

        const res = await fetch(`/api/tournaments?${params}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setTournaments(data.tournaments)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        logger.error('Failed to fetch tournaments')
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
    return () => controller.abort()
  }, [tab])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-500" />
          <h1 className="text-2xl font-bold">Torneos</h1>
        </div>
        <GlassButton variant="solid" size="sm" asChild>
          <Link href="/tournaments/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear torneo
          </Link>
        </GlassButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: '', label: 'Todos' },
          { value: 'REGISTRATION', label: 'Abiertos' },
          { value: 'IN_PROGRESS', label: 'En curso' },
          { value: 'COMPLETED', label: 'Completados' },
        ].map((filter) => (
          <GlassButton
            key={filter.value}
            variant={tab === filter.value ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setTab(filter.value)}
          >
            {filter.label}
          </GlassButton>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tournaments.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay torneos</p>
            <p className="text-sm mt-1">Se el primero en crear un torneo</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => (
            <GlassCard key={t.id} intensity="light" padding="lg" hover="lift" asChild>
              <Link href={`/tournaments/${t.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{t.name}</h3>
                      <GlassBadge variant={statusVariant[t.status] || 'default'} size="sm">
                        {statusLabels[t.status]}
                      </GlassBadge>
                    </div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(t.startDate, 'medium')}
                      </span>
                      {t.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {t._count.participants}/{t.maxPlayers} jugadores
                      </span>
                      <span>{t.format.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
