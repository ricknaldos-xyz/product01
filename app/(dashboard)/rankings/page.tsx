'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { RankingHero } from '@/components/rankings/RankingHero'
import { TopPodium } from '@/components/rankings/TopPodium'
import { CategoryExplainer } from '@/components/rankings/CategoryExplainer'
import { Trophy, Medal, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import { useSport } from '@/contexts/SportContext'
import type { SkillTier } from '@prisma/client'

interface RankingPlayer {
  rank: number
  userId: string
  displayName: string | null
  avatarUrl: string | null
  region: string | null
  city: string | null
  skillTier: SkillTier
  compositeScore: number | null
  effectiveScore: number | null
  countryRank: number | null
  matchesPlayed: number
  matchesWon: number
}

interface MyPosition {
  compositeScore: number | null
  effectiveScore: number | null
  skillTier: SkillTier
  countryRank: number | null
  totalInCountry: number
  totalInTier: number
}

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PRIMERA_A,PRIMERA_B', label: '1ra' },
  { value: 'SEGUNDA_A,SEGUNDA_B', label: '2da' },
  { value: 'TERCERA_A,TERCERA_B', label: '3ra' },
  { value: 'CUARTA_A,CUARTA_B', label: '4ta' },
  { value: 'QUINTA_A,QUINTA_B', label: '5ta' },
]

export default function RankingsPage() {
  const { activeSport } = useSport()
  const [rankings, setRankings] = useState<RankingPlayer[]>([])
  const [myPosition, setMyPosition] = useState<MyPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchRankings()
    fetchMyPosition()
  }, [page, categoryFilter, activeSport?.slug])

  async function fetchRankings() {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({
        country: 'PE',
        page: page.toString(),
        limit: '20',
        sport: activeSport?.slug || 'tennis',
      })
      if (categoryFilter) params.set('skillTier', categoryFilter)

      const res = await fetch(`/api/rankings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRankings(data.rankings)
      setTotalPages(data.pagination.totalPages)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyPosition() {
    try {
      const res = await fetch(`/api/rankings/my-position?sport=${activeSport?.slug || 'tennis'}`)
      if (res.ok) {
        const data = await res.json()
        setMyPosition(data)
      }
    } catch {
      // User might not have a profile yet
    }
  }

  const isFiltered = categoryFilter !== ''
  const podiumPlayers = rankings.slice(0, 3)
  const listPlayers = isFiltered ? rankings : rankings.slice(3)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-yellow-500" />
        <h1 className="text-2xl font-bold">Rankings Peru</h1>
      </div>

      {/* Hero: self-contained, fetches own data */}
      <RankingHero />

      {/* Top 3 Podium (only when showing "Todos" unfiltered on page 1) */}
      {!isFiltered && page === 1 && !loading && !error && (
        <TopPodium players={podiumPlayers} />
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORY_FILTERS.map((filter) => (
          <GlassButton
            key={filter.value}
            variant={categoryFilter === filter.value ? 'solid' : 'outline'}
            size="sm"
            onClick={() => { setCategoryFilter(filter.value); setPage(1) }}
          >
            {filter.label}
          </GlassButton>
        ))}
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-16">
          <GlassCard intensity="medium" padding="xl" className="max-w-md text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
            <h2 className="text-xl font-bold mb-2">Error al cargar</h2>
            <p className="text-muted-foreground mb-6">No se pudo cargar la informacion.</p>
            <GlassButton variant="solid" onClick={() => fetchRankings()}>
              Intentar de nuevo
            </GlassButton>
          </GlassCard>
        </div>
      )}

      {/* Rankings List (from #4 when unfiltered, from #1 when filtered) */}
      {!error && <GlassCard intensity="light" padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : listPlayers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay jugadores clasificados aun
          </div>
        ) : (
          <div className="divide-y divide-glass-border-light">
            {listPlayers.map((player) => (
              <div
                key={player.userId}
                className="flex items-center gap-4 px-5 py-3 hover:glass-ultralight transition-all"
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {player.rank <= 3 ? (
                    <Medal className={`h-6 w-6 mx-auto ${
                      player.rank === 1 ? 'text-yellow-500' :
                      player.rank === 2 ? 'text-slate-400' :
                      'text-amber-600'
                    }`} />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {player.rank}
                    </span>
                  )}
                </div>

                {/* Player Info */}
                <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {player.avatarUrl ? (
                    <Image src={player.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {(player.displayName || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {player.displayName || 'Jugador'}
                    </p>
                    <TierBadge tier={player.skillTier} size="sm" />
                  </div>
                  {player.region && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[player.city, player.region].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold tabular-nums">
                    {player.effectiveScore?.toFixed(1) || '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {player.matchesPlayed} partidos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </GlassButton>
          <span className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </span>
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </GlassButton>
        </div>
      )}

      {/* Category explainer */}
      <CategoryExplainer currentTier={myPosition?.skillTier} />
    </div>
  )
}
