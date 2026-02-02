'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Video, ArrowRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Loader2, AlertCircle, ArrowUpDown, GitCompareArrows } from 'lucide-react'
import { formatRelativeTime } from '@/lib/date-utils'
import { getScoreBorderColor, STATUS_LABELS, STATUS_VARIANTS } from '@/lib/analysis-constants'
import { ScoreRing } from '@/components/analysis/ScoreRing'

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
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'best', label: 'Mejor score' },
  { value: 'worst', label: 'Peor score' },
] as const

type SortOption = typeof SORT_OPTIONS[number]['value']

const ITEMS_PER_PAGE = 10

const QUICK_START_TECHNIQUES = [
  { name: 'Saque', icon: '🎾' },
  { name: 'Derecha', icon: '💪' },
  { name: 'Reves', icon: '🔄' },
]

export function AnalysesList({ analyses }: AnalysesListProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sportFilter, setSportFilter] = useState(searchParams.get('sport') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'recent')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const params = new URLSearchParams()
    if (sportFilter) params.set('sport', sportFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (sortBy !== 'recent') params.set('sort', sortBy)
    if (page > 1) params.set('page', String(page))
    const query = params.toString()
    router.replace(query ? `?${query}` : '', { scroll: false })
  }, [sportFilter, statusFilter, sortBy, page, router])

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
    const result = analyses.filter((a) => {
      if (sportFilter && a.technique.sport.slug !== sportFilter) return false
      if (statusFilter && a.status !== statusFilter) return false
      return true
    })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'best') {
        return (b.overallScore ?? -1) - (a.overallScore ?? -1)
      }
      if (sortBy === 'worst') {
        return (a.overallScore ?? 999) - (b.overallScore ?? 999)
      }
      // recent (default) — by createdAt desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [analyses, sportFilter, statusFilter, sortBy])

  // Stats for completed analyses
  const stats = useMemo(() => {
    const completed = filtered.filter((a) => a.status === 'COMPLETED' && a.overallScore != null)
    if (completed.length === 0) return null
    const scores = completed.map((a) => a.overallScore!)
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const best = Math.max(...scores)
    return { count: completed.length, avg, best }
  }, [filtered])

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(page * ITEMS_PER_PAGE, filtered.length)

  // Reset page on filter change
  const handleSportFilter = useCallback((slug: string) => {
    setSportFilter(slug)
    setPage(1)
  }, [])
  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status)
    setPage(1)
  }, [])
  const handleSort = useCallback((sort: SortOption) => {
    setSortBy(sort)
    setPage(1)
  }, [])

  return (
    <div className="space-y-4">
      {/* Compact filter bar — single row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {/* Sport filters (only if multiple sports) */}
        {sports.length > 1 && (
          <>
            <GlassButton
              variant={sportFilter === '' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => handleSportFilter('')}
              className="h-7 px-3 text-xs rounded-full"
            >
              Todos
            </GlassButton>
            {sports.map((sport) => (
              <GlassButton
                key={sport.slug}
                variant={sportFilter === sport.slug ? 'solid' : 'outline'}
                size="sm"
                onClick={() => handleSportFilter(sport.slug)}
                aria-label={`Filtrar por ${sport.name}`}
                className="h-7 px-3 text-xs rounded-full"
              >
                {sport.slug === 'tennis' ? '🎾' : '🏅'} {sport.name}
              </GlassButton>
            ))}
            <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
          </>
        )}

        {/* Status filters */}
        {STATUS_FILTERS.map((filter) => (
          <GlassButton
            key={filter.value}
            variant={statusFilter === filter.value ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => handleStatusFilter(filter.value)}
            aria-label={`Filtrar por estado: ${filter.label}`}
            className="h-7 px-3 text-xs rounded-full"
          >
            {filter.label}
          </GlassButton>
        ))}

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 pl-3 ml-auto border-l border-glass">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Ordenar:</span>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            {SORT_OPTIONS.map((opt) => (
              <GlassButton
                key={opt.value}
                variant={sortBy === opt.value ? 'solid' : 'ghost'}
                size="sm"
                onClick={() => handleSort(opt.value)}
                aria-label={`Ordenar por ${opt.label}`}
                className="h-7 px-3 text-xs rounded-full"
              >
                {opt.label}
              </GlassButton>
            ))}
          </div>
          <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
          <GlassButton
            variant={compareMode ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => { setCompareMode(!compareMode); setSelected([]) }}
            className="h-7 px-3 text-xs rounded-full"
          >
            <GitCompareArrows className="h-3 w-3 mr-1" />
            Comparar
          </GlassButton>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="glass-ultralight border-glass rounded-lg px-3 py-2 text-sm text-muted-foreground">
          {stats.count} analisis completados &bull; Promedio: {stats.avg.toFixed(1)}/10 &bull; Mejor: {stats.best.toFixed(1)}/10
        </div>
      )}

      {/* Compare floating bar */}
      {compareMode && selected.length === 2 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40">
          <GlassButton
            variant="solid"
            size="lg"
            onClick={() => router.push(`/analyses/compare?a=${selected[0]}&b=${selected[1]}`)}
            className="shadow-glass-glow"
          >
            <GitCompareArrows className="h-4 w-4 mr-2" />
            Comparar seleccionados
          </GlassButton>
        </div>
      )}

      {compareMode && selected.length > 0 && selected.length < 2 && (
        <div className="glass-ultralight border-glass rounded-lg px-3 py-2 text-sm text-muted-foreground text-center">
          Selecciona 1 analisis mas para comparar
        </div>
      )}

      {/* Analysis cards */}
      {paginated.length > 0 ? (
        <div className="grid gap-4">
          {paginated.map((analysis) => {
            const scoreDelta = analysis.overallScore != null && analysis.previousAnalysis?.overallScore != null
              ? analysis.overallScore - analysis.previousAnalysis.overallScore
              : null

            const hasScore = analysis.overallScore != null
            const borderColor = hasScore ? getScoreBorderColor(analysis.overallScore!) : 'border-l-muted-foreground/30'
            const isSelected = selected.includes(analysis.id)
            const isCompleted = analysis.status === 'COMPLETED'

            const cardContent = (
              <>
                {/* Compare checkbox */}
                {compareMode && isCompleted && (
                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelected((prev) =>
                          prev.includes(analysis.id)
                            ? prev.filter((id) => id !== analysis.id)
                            : prev.length < 2
                              ? [...prev, analysis.id]
                              : prev
                        )
                      }}
                      className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                    />
                  </div>
                )}

                {/* Left: Mini ScoreRing or status icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  {hasScore ? (
                    <ScoreRing score={analysis.overallScore!} size="sm" />
                  ) : (
                    <div className="w-[60px] h-[60px] glass-primary border-glass rounded-xl flex items-center justify-center">
                      {analysis.status === 'PROCESSING' ? (
                        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                      ) : analysis.status === 'FAILED' ? (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <Video className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  {/* Delta indicator next to mini ring */}
                  {scoreDelta !== null && scoreDelta !== 0 && (
                    <div className={`hidden sm:flex items-center gap-0.5 text-xs font-medium ${scoreDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {scoreDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {scoreDelta > 0 ? '+' : ''}{scoreDelta.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {analysis.technique.name}
                      {analysis.variant && (
                        <span className="text-muted-foreground font-normal"> - {analysis.variant.name}</span>
                      )}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(new Date(analysis.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.technique.sport.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                    <GlassBadge
                      variant={(STATUS_VARIANTS[analysis.status] ?? 'default') as 'default' | 'primary' | 'success' | 'warning' | 'destructive'}
                      size="sm"
                    >
                      {STATUS_LABELS[analysis.status] ?? analysis.status}
                    </GlassBadge>
                    {analysis._count.issues > 0 && (
                      <span className="text-muted-foreground text-xs">
                        {analysis._count.issues} problema{analysis._count.issues > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block flex-shrink-0" />
              </>
            )

            if (compareMode && isCompleted) {
              return (
                <GlassCard
                  key={analysis.id}
                  intensity="light"
                  padding="lg"
                  hover="lift"
                  className={`flex items-center gap-4 cursor-pointer border-l-4 ${borderColor} ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setSelected((prev) =>
                      prev.includes(analysis.id)
                        ? prev.filter((id) => id !== analysis.id)
                        : prev.length < 2
                          ? [...prev, analysis.id]
                          : prev
                    )
                  }}
                >
                  {cardContent}
                </GlassCard>
              )
            }

            return (
              <GlassCard
                key={analysis.id}
                intensity="light"
                padding="lg"
                hover="lift"
                className={`flex items-center gap-4 cursor-pointer border-l-4 ${borderColor}`}
                asChild
              >
                <Link href={`/analyses/${analysis.id}`}>
                  {cardContent}
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
            <>
              <GlassButton variant="solid" size="lg" asChild>
                <Link href="/analyze">Crear primer analisis</Link>
              </GlassButton>
              <div className="mt-8">
                <p className="text-sm text-muted-foreground mb-4">Empieza analizando una de estas tecnicas:</p>
                <div className="flex justify-center gap-3">
                  {QUICK_START_TECHNIQUES.map((t) => (
                    <GlassCard
                      key={t.name}
                      intensity="light"
                      padding="md"
                      hover="lift"
                      className="cursor-pointer text-center"
                      asChild
                    >
                      <Link href="/analyze">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <div className="text-sm font-medium">{t.name}</div>
                      </Link>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </>
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
            Mostrando {start}-{end} de {filtered.length} analisis
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
