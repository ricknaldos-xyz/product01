'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import {
  Trophy, Loader2, Search, Users, Calendar, MapPin,
} from 'lucide-react'

type TournamentStatus = 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN'

interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  format: TournamentFormat
  status: TournamentStatus
  maxPlayers: number
  venue: string | null
  city: string | null
  startDate: string | null
  endDate: string | null
  registrationEnd: string | null
  createdAt: string
  organizer: {
    displayName: string
    avatarUrl: string | null
    user: { name: string | null; email: string | null }
  } | null
  _count: { participants: number }
}

interface TournamentsResponse {
  tournaments: Tournament[]
  total: number
  page: number
  totalPages: number
}

const FILTER_TABS: { label: string; value: TournamentStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Registro', value: 'REGISTRATION' },
  { label: 'En Curso', value: 'IN_PROGRESS' },
  { label: 'Completados', value: 'COMPLETED' },
  { label: 'Cancelados', value: 'CANCELLED' },
]

const STATUS_CONFIG: Record<TournamentStatus, { label: string; variant: 'primary' | 'warning' | 'success' | 'destructive' }> = {
  REGISTRATION: { label: 'Registro', variant: 'primary' },
  IN_PROGRESS: { label: 'En Curso', variant: 'warning' },
  COMPLETED: { label: 'Completado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SINGLE_ELIMINATION: 'Eliminacion Simple',
  DOUBLE_ELIMINATION: 'Eliminacion Doble',
  ROUND_ROBIN: 'Round Robin',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminTournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<TournamentStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchTournaments = useCallback(async (filter: TournamentStatus | 'ALL', page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter !== 'ALL') {
        params.set('status', filter)
      }
      if (search) {
        params.set('search', search)
      }
      const res = await fetch(`/api/admin/tournaments?${params}`)
      if (res.ok) {
        const data: TournamentsResponse = await res.json()
        setTournaments(data.tournaments)
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        })
      } else {
        toast.error('Error al cargar torneos')
      }
    } catch (error) {
      logger.error('Error fetching tournaments:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTournaments(activeFilter, 1, searchQuery)
  }, [activeFilter, searchQuery, fetchTournaments])

  const handleFilterChange = (filter: TournamentStatus | 'ALL') => {
    setActiveFilter(filter)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Gestion de Torneos</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <GlassButton type="submit" variant="solid" size="sm">
          Buscar
        </GlassButton>
      </form>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <GlassButton
            key={tab.value}
            variant={activeFilter === tab.value ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => handleFilterChange(tab.value)}
          >
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Total count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {pagination.total} torneo{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} intensity="light" padding="lg">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded-full" />
                </div>
                <div className="h-4 w-64 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay torneos</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron torneos con los filtros seleccionados.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament) => {
            const statusConfig = STATUS_CONFIG[tournament.status]

            return (
              <GlassCard
                key={tournament.id}
                intensity="light"
                padding="lg"
                className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                onClick={() => router.push(`/admin/tournaments/${tournament.id}`)}
              >
                <div className="space-y-3">
                  {/* Top: Name + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-semibold">{tournament.name}</h3>
                    <GlassBadge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </GlassBadge>
                  </div>

                  {/* Organizer */}
                  <p className="text-sm text-muted-foreground">
                    Organizador: {tournament.organizer?.displayName || tournament.organizer?.user?.name || 'Sin organizador'}
                  </p>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <GlassBadge variant="default" size="sm">
                      {FORMAT_LABELS[tournament.format]}
                    </GlassBadge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{tournament._count.participants} / {tournament.maxPlayers}</span>
                    </div>
                    {(tournament.venue || tournament.city) && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{[tournament.venue, tournament.city].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {tournament.startDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(tournament.startDate)}{tournament.endDate ? ` - ${formatDate(tournament.endDate)}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <GlassButton
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const newPage = pagination.page - 1
                  setPagination((prev) => ({ ...prev, page: newPage }))
                  fetchTournaments(activeFilter, newPage, searchQuery)
                }}
              >
                Anterior
              </GlassButton>
              <span className="text-sm text-muted-foreground">
                Pagina {pagination.page} de {pagination.totalPages}
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const newPage = pagination.page + 1
                  setPagination((prev) => ({ ...prev, page: newPage }))
                  fetchTournaments(activeFilter, newPage, searchQuery)
                }}
              >
                Siguiente
              </GlassButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
