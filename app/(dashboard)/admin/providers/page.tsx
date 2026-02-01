'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Shield, Loader2, CheckCircle, XCircle, Building2,
  MapPin, Wrench, Phone, Mail,
} from 'lucide-react'
import { toast } from 'sonner'

type ProviderType = 'COURT' | 'WORKSHOP'
type ProviderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

interface ProviderApplication {
  id: string
  userId: string
  user: { name: string | null; email: string | null }
  type: ProviderType
  status: ProviderStatus
  businessName: string
  businessPhone: string
  businessEmail: string | null
  description: string | null
  documentUrls: string[]
  reviewedAt: string | null
  reviewNotes: string | null
  reviewedBy: string | null
  createdAt: string
}

interface PaginatedResponse {
  data: ProviderApplication[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const FILTER_TABS: { label: string; value: ProviderStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING_APPROVAL' },
  { label: 'Aprobados', value: 'APPROVED' },
  { label: 'Rechazados', value: 'REJECTED' },
]

const STATUS_CONFIG: Record<ProviderStatus, { label: string; variant: 'warning' | 'success' | 'destructive' | 'default' }> = {
  PENDING_APPROVAL: { label: 'Pendiente', variant: 'warning' },
  APPROVED: { label: 'Aprobado', variant: 'success' },
  REJECTED: { label: 'Rechazado', variant: 'destructive' },
  SUSPENDED: { label: 'Suspendido', variant: 'default' },
}

const TYPE_CONFIG: Record<ProviderType, { label: string; icon: typeof MapPin }> = {
  COURT: { label: 'Cancha', icon: MapPin },
  WORKSHOP: { label: 'Taller', icon: Wrench },
}

export default function AdminProvidersPage() {
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<ProviderStatus | 'ALL'>('ALL')
  const [actionId, setActionId] = useState<string | null>(null)
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null)
  const [reviewNotesMap, setReviewNotesMap] = useState<Record<string, string>>({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchApplications = useCallback(async (filter: ProviderStatus | 'ALL', page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter !== 'ALL') {
        params.set('status', filter)
      }
      const res = await fetch(`/api/admin/providers?${params}`)
      if (res.ok) {
        const data: PaginatedResponse = await res.json()
        setApplications(data.data)
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
        })
      } else {
        toast.error('Error al cargar solicitudes')
      }
    } catch (error) {
      logger.error('Error fetching provider applications:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications(activeFilter)
  }, [activeFilter, fetchApplications])

  const handleReview = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionId(applicationId)
    try {
      const res = await fetch(`/api/admin/providers/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotesMap[applicationId] || undefined,
        }),
      })
      if (res.ok) {
        toast.success(status === 'APPROVED' ? 'Solicitud aprobada exitosamente' : 'Solicitud rechazada')
        fetchApplications(activeFilter, pagination.page)
        setReviewNotesMap((prev) => {
          const next = { ...prev }
          delete next[applicationId]
          return next
        })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al actualizar solicitud')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setActionId(null)
    }
  }

  const handleFilterChange = (filter: ProviderStatus | 'ALL') => {
    setActiveFilter(filter)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Solicitudes de Proveedores</h1>
      </div>

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
          {pagination.total} solicitud{pagination.total !== 1 ? 'es' : ''} encontrada{pagination.total !== 1 ? 's' : ''}
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
      ) : applications.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay solicitudes en esta categoria</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron solicitudes de proveedores con el filtro seleccionado.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status]
            const typeConfig = TYPE_CONFIG[app.type]
            const TypeIcon = typeConfig.icon
            const isPending = app.status === 'PENDING_APPROVAL'
            const isActioning = actionId === app.id

            return (
              <GlassCard key={app.id} intensity="light" padding="lg">
                <div className="space-y-4">
                  {/* Top: Name, type badge, status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{app.businessName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.user.name || 'Sin nombre'} - {app.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <GlassBadge variant="primary" size="sm">
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </GlassBadge>
                      <GlassBadge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </GlassBadge>
                    </div>
                  </div>

                  {/* Description */}
                  {app.description && (
                    <p className="text-sm text-foreground/80">{app.description}</p>
                  )}

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{app.businessPhone}</span>
                    </div>
                    {app.businessEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{app.businessEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    Solicitado el {new Date(app.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>

                  {/* Review notes (for already reviewed) */}
                  {app.reviewNotes && !isPending && (
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-sm text-muted-foreground">
                        Notas de revision: {app.reviewNotes}
                      </p>
                    </div>
                  )}

                  {/* Action section for pending */}
                  {isPending && (
                    <div className="space-y-3 pt-2 border-t border-glass">
                      {/* Review notes input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Notas de revision (opcional)
                        </label>
                        <textarea
                          value={reviewNotesMap[app.id] || ''}
                          onChange={(e) =>
                            setReviewNotesMap((prev) => ({
                              ...prev,
                              [app.id]: e.target.value,
                            }))
                          }
                          placeholder="Agregar notas sobre la revision..."
                          rows={2}
                          className="w-full rounded-xl border border-glass bg-glass-light px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>

                      {/* Reject confirmation */}
                      {confirmRejectId === app.id && (
                        <div className="rounded-lg bg-destructive/10 p-3 space-y-2">
                          <p className="text-sm font-medium text-destructive">
                            Estas seguro de rechazar esta solicitud?
                          </p>
                          <div className="flex items-center gap-2">
                            <GlassButton
                              variant="destructive"
                              size="sm"
                              disabled={isActioning}
                              onClick={() => {
                                handleReview(app.id, 'REJECTED')
                                setConfirmRejectId(null)
                              }}
                            >
                              {isActioning ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : null}
                              Confirmar rechazo
                            </GlassButton>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmRejectId(null)}
                            >
                              Cancelar
                            </GlassButton>
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex items-center gap-3">
                        <GlassButton
                          variant="solid"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleReview(app.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          aria-label="Aprobar solicitud"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Aprobar
                        </GlassButton>
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => setConfirmRejectId(app.id)}
                          aria-label="Rechazar solicitud"
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Rechazar
                        </GlassButton>
                      </div>
                    </div>
                  )}
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
                  fetchApplications(activeFilter, newPage)
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
                  fetchApplications(activeFilter, newPage)
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
