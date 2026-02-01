'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { RankingHero } from '@/components/rankings/RankingHero'
import { ImprovementPath } from '@/components/rankings/ImprovementPath'
import { TopPodium } from '@/components/rankings/TopPodium'
import { CategoryExplainer } from '@/components/rankings/CategoryExplainer'
import { RankingTable, type RankingEntry } from '@/components/rankings/RankingTable'
import { Trophy, Medal, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Search, X } from 'lucide-react'
import { useSport } from '@/contexts/SportContext'
import { useSession } from 'next-auth/react'
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
  previousRank: number | null
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
  const { data: session } = useSession()
  const [rankings, setRankings] = useState<RankingPlayer[]>([])
  const [myPosition, setMyPosition] = useState<MyPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchRankings()
    fetchMyPosition()
  }, [page, categoryFilter, activeSport?.slug, debouncedSearch])

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
      if (debouncedSearch) params.set('search', debouncedSearch)

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

      {/* Improvement path for ranked users */}
      <ImprovementPath />

      {myPosition?.skillTier === 'UNRANKED' && (
        <CategoryExplainer currentTier={myPosition?.skillTier} />
      )}

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar jugador"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-glass-light border border-glass text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Limpiar busqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Empty search results */}
      {!error && !loading && rankings.length === 0 && debouncedSearch && (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No se encontraron jugadores para &apos;{searchQuery}&apos;</h3>
            <GlassButton variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Limpiar busqueda
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Rankings Table */}
      {!error && (rankings.length > 0 || !debouncedSearch) && (
        <RankingTable
          rankings={listPlayers.map(p => ({
            rank: p.rank,
            userId: p.userId,
            displayName: p.displayName,
            avatarUrl: p.avatarUrl,
            region: p.region,
            city: p.city,
            skillTier: p.skillTier,
            effectiveScore: p.effectiveScore,
            matchesPlayed: p.matchesPlayed,
            previousRank: p.previousRank,
          }))}
          loading={loading}
          currentUserId={session?.user?.id}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <GlassButton
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Pagina anterior"
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
            aria-label="Pagina siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </GlassButton>
        </div>
      )}

      {/* Category explainer */}
      {myPosition?.skillTier !== 'UNRANKED' && (
        <CategoryExplainer currentTier={myPosition?.skillTier} />
      )}
    </div>
  )
}
