'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Flag, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Ban, EyeOff, XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportItem {
  id: string
  reporterId: string
  reporter: {
    id: string
    user: { name: string | null; email: string | null }
  }
  targetId: string
  target: {
    id: string
    user: { name: string | null; email: string | null }
  }
  targetType: string
  reason: string
  description: string | null
  resolved: boolean
  resolvedAction: string | null
  resolvedAt: string | null
  resolvedById: string | null
  createdAt: string
}

interface ReportsResponse {
  reports: ReportItem[]
  total: number
  page: number
  totalPages: number
}

type TabValue = 'pending' | 'resolved'

const TABS: { label: string; value: TabValue }[] = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Resueltos', value: 'resolved' },
]

const REASON_LABELS: Record<string, { label: string; variant: 'destructive' | 'warning' | 'primary' | 'default' }> = {
  SPAM: { label: 'Spam', variant: 'default' },
  INAPPROPRIATE: { label: 'Inapropiado', variant: 'warning' },
  HARASSMENT: { label: 'Acoso', variant: 'destructive' },
  FAKE_PROFILE: { label: 'Perfil falso', variant: 'primary' },
  OTHER: { label: 'Otro', variant: 'default' },
}

const ACTION_LABELS: Record<string, string> = {
  warn: 'Advertencia',
  hide_content: 'Contenido oculto',
  ban_user: 'Usuario baneado',
  dismissed: 'Descartado',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabValue>('pending')
  const [actionId, setActionId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ reportId: string; action: string } | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchReports = useCallback(async (status: TabValue, currentPage = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '20',
        status,
      })
      const res = await fetch(`/api/admin/reports?${params}`)
      if (res.ok) {
        const data: ReportsResponse = await res.json()
        setReports(data.reports)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      } else {
        toast.error('Error al cargar reportes')
      }
    } catch (error) {
      logger.error('Error fetching reports:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports(activeTab, page)
  }, [activeTab, page, fetchReports])

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleAction = async (reportId: string, action: 'warn' | 'hide_content' | 'ban_user' | 'dismiss') => {
    setActionId(reportId)
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        toast.success('Reporte resuelto exitosamente')
        fetchReports(activeTab, page)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al resolver reporte')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Flag className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Moderacion de Reportes</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <GlassButton
            key={tab.value}
            variant={activeTab === tab.value ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Total count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {total} reporte{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} intensity="light" padding="lg">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-40 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded-full" />
                </div>
                <div className="h-4 w-64 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay reportes en esta categoria</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron reportes con el filtro seleccionado.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reasonConfig = REASON_LABELS[report.reason] || { label: report.reason, variant: 'default' as const }
            const isActioning = actionId === report.id
            const isPending = !report.resolved

            return (
              <GlassCard key={report.id} intensity="light" padding="lg">
                <div className="space-y-4">
                  {/* Top: Reporter -> Target, reason badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {report.reporter?.user?.name || 'Usuario desconocido'}
                        <span className="text-muted-foreground font-normal mx-2">reporto a</span>
                        {report.target?.user?.name || 'Usuario desconocido'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {report.targetType} &middot; {formatDate(report.createdAt)}
                      </p>
                    </div>
                    <GlassBadge variant={reasonConfig.variant}>
                      {reasonConfig.label}
                    </GlassBadge>
                  </div>

                  {/* Description */}
                  {report.description && (
                    <p className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-3">
                      {report.description}
                    </p>
                  )}

                  {/* Resolved info */}
                  {report.resolved && report.resolvedAction && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Accion tomada:</span>
                      <GlassBadge variant="primary" size="sm">
                        {ACTION_LABELS[report.resolvedAction] || report.resolvedAction}
                      </GlassBadge>
                      {report.resolvedAt && (
                        <span className="text-muted-foreground">
                          el {formatDate(report.resolvedAt)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons for pending reports */}
                  {isPending && (
                    <div className="space-y-3 pt-2 border-t border-glass">
                      {confirmAction?.reportId === report.id && confirmAction.action === 'ban_user' ? (
                        <div className="rounded-lg bg-destructive/10 p-3 space-y-2">
                          <p className="text-sm font-medium text-destructive">
                            Estas seguro de banear a este usuario? Esta accion no se puede deshacer.
                          </p>
                          <div className="flex items-center gap-2">
                            <GlassButton
                              variant="destructive"
                              size="sm"
                              disabled={isActioning}
                              onClick={() => {
                                handleAction(report.id, 'ban_user')
                                setConfirmAction(null)
                              }}
                            >
                              {isActioning ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Confirmar
                            </GlassButton>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmAction(null)}
                            >
                              Cancelar
                            </GlassButton>
                          </div>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(report.id, 'warn')}
                          aria-label="Advertir"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          )}
                          Advertir
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(report.id, 'hide_content')}
                          aria-label="Ocultar contenido"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-2" />
                          )}
                          Ocultar Contenido
                        </GlassButton>
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => setConfirmAction({ reportId: report.id, action: 'ban_user' })}
                          aria-label="Banear usuario"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Ban className="h-4 w-4 mr-2" />
                          )}
                          Banear Usuario
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(report.id, 'dismiss')}
                          aria-label="Desestimar"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Descartar
                        </GlassButton>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * 20) + 1}-{Math.min(page * 20, total)} de {total} reportes
              </p>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </GlassButton>
                <span className="text-sm font-medium px-2">
                  {page} / {totalPages}
                </span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
