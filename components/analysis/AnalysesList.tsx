'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Video, ArrowRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface AnalysisItem {
  id: string
  status: string
  overallScore: number | null
  createdAt: string
  technique: {
    name: string
    sport: { slug: string; name: string }
  }
  variant: { name: string } | null
  previousAnalysis: { overallScore: number | null } | null
  _count: { issues: number }
}

interface AnalysesListProps {
  analyses: AnalysisItem[]
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'FAILED', label: 'Error' },
]

const ITEMS_PER_PAGE = 10

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-500'
  if (score >= 6) return 'text-yellow-500'
  return 'text-red-500'
}

export function AnalysesList({ analyses }: AnalysesListProps) {
  const [sportFilter, setSportFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // Extract unique sports
  const sports = useMemo(() => {
    const sportMap = new Map<string, { slug: string; name: string }>()
    for (const a of analyses) {
      sportMap.set(a.technique.sport.slug, a.technique.sport)
    }
    return Array.from(sportMap.values())
  }, [analyses])

  // Filter
  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      if (sportFilter && a.technique.sport.slug !== sportFilter) return false
      if (statusFilter && a.status !== statusFilter) return false
      return true
    })
  }, [analyses, sportFilter, statusFilter])

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reset page on filter change
  const handleSportFilter = (slug: string) => {
    setSportFilter(slug)
    setPage(1)
  }
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Sport filter tabs */}
      {sports.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <GlassButton
            variant={sportFilter === '' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => handleSportFilter('')}
          >
            Todos
          </GlassButton>
          {sports.map((sport) => (
            <GlassButton
              key={sport.slug}
              variant={sportFilter === sport.slug ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleSportFilter(sport.slug)}
            >
              {sport.slug === 'tennis' ? '🎾' : '🏅'} {sport.name}
            </GlassButton>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <GlassButton
            key={filter.value}
            variant={statusFilter === filter.value ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => handleStatusFilter(filter.value)}
          >
            {filter.label}
          </GlassButton>
        ))}
      </div>

      {/* Analysis cards */}
      {paginated.length > 0 ? (
        <div className="grid gap-4">
          {paginated.map((analysis) => {
            const scoreDelta = analysis.overallScore != null && analysis.previousAnalysis?.overallScore != null
              ? analysis.overallScore - analysis.previousAnalysis.overallScore
              : null

            return (
              <GlassCard
                key={analysis.id}
                intensity="light"
                padding="lg"
                hover="lift"
                className="flex items-center gap-4 cursor-pointer"
                asChild
              >
                <Link href={`/analyses/${analysis.id}`}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 glass-primary border-glass rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                    {analysis.technique.sport.slug === 'tennis' ? '🎾' : '🏅'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{analysis.technique.name}</h3>
                      {analysis.variant && (
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          - {analysis.variant.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.technique.sport.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                      <GlassBadge
                        variant={
                          analysis.status === 'COMPLETED'
                            ? 'success'
                            : analysis.status === 'PROCESSING'
                            ? 'warning'
                            : analysis.status === 'FAILED'
                            ? 'destructive'
                            : 'default'
                        }
                        size="sm"
                      >
                        {analysis.status === 'COMPLETED'
                          ? 'Completado'
                          : analysis.status === 'PROCESSING'
                          ? 'Procesando'
                          : analysis.status === 'FAILED'
                          ? 'Error'
                          : 'Pendiente'}
                      </GlassBadge>
                      {analysis._count.issues > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {analysis._count.issues} problema{analysis._count.issues > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(new Date(analysis.createdAt))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {analysis.overallScore != null && (
                      <div className="text-center">
                        <div className="glass-primary border-glass rounded-xl px-3 py-2">
                          <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                            {analysis.overallScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">/10</div>
                        </div>
                        {scoreDelta !== null && scoreDelta !== 0 && (
                          <div className={`flex items-center justify-center gap-0.5 mt-1 text-xs font-medium ${scoreDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {scoreDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta.toFixed(1)}
                          </div>
                        )}
                      </div>
                    )}
                    <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  </div>
                </Link>
              </GlassCard>
            )
          })}
        </div>
      ) : (
        <GlassCard intensity="light" padding="xl" className="text-center">
          <div className="glass-ultralight border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {sportFilter || statusFilter ? 'No hay analisis con estos filtros' : 'No tienes analisis aun'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {sportFilter || statusFilter
              ? 'Intenta cambiar los filtros para ver mas resultados'
              : 'Sube tu primer video para que nuestra IA analice tu tecnica y te de recomendaciones personalizadas'}
          </p>
          {!sportFilter && !statusFilter && (
            <GlassButton variant="solid" size="lg" asChild>
              <Link href="/analyze">Crear primer analisis</Link>
            </GlassButton>
          )}
        </GlassCard>
      )}

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
    </div>
  )
}
