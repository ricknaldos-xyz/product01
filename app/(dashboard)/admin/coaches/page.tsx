'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Shield, Loader2, CheckCircle, XCircle, ExternalLink, Star, Users,
} from 'lucide-react'
import { toast } from 'sonner'

type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'

interface CoachProfile {
  id: string
  userId: string
  user: { name: string | null; email: string | null }
  headline: string | null
  bio: string | null
  certifications: string[]
  yearsExperience: number | null
  specialties: string[]
  verificationStatus: VerificationStatus
  verificationDocUrl: string | null
  verifiedAt: string | null
  country: string
  city: string | null
  hourlyRate: number | null
  currency: string
  isAvailable: boolean
  averageRating: number
  totalReviews: number
  _count: { students: number }
  createdAt: string
}

interface PaginatedResponse {
  data: CoachProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const FILTER_TABS: { label: string; value: VerificationStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING_VERIFICATION' },
  { label: 'Verificados', value: 'VERIFIED' },
  { label: 'Rechazados', value: 'REJECTED' },
]

const STATUS_CONFIG: Record<VerificationStatus, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  PENDING_VERIFICATION: { label: 'Pendiente', variant: 'warning' },
  VERIFIED: { label: 'Verificado', variant: 'success' },
  REJECTED: { label: 'Rechazado', variant: 'destructive' },
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<VerificationStatus | 'ALL'>('ALL')
  const [actionId, setActionId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchCoaches = useCallback(async (filter: VerificationStatus | 'ALL', page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter !== 'ALL') {
        params.set('status', filter)
      }
      const res = await fetch(`/api/admin/coaches?${params}`)
      if (res.ok) {
        const data: PaginatedResponse = await res.json()
        setCoaches(data.data)
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
        })
      } else {
        toast.error('Error al cargar coaches')
      }
    } catch (error) {
      logger.error('Error fetching coaches:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoaches(activeFilter)
  }, [activeFilter, fetchCoaches])

  const handleVerification = async (coachId: string, status: 'VERIFIED' | 'REJECTED') => {
    setActionId(coachId)
    try {
      const res = await fetch(`/api/admin/coaches/${coachId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(status === 'VERIFIED' ? 'Coach aprobado exitosamente' : 'Coach rechazado')
        fetchCoaches(activeFilter, pagination.page)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al actualizar coach')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setActionId(null)
    }
  }

  const handleFilterChange = (filter: VerificationStatus | 'ALL') => {
    setActiveFilter(filter)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Verificacion de Coaches</h1>
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
          {pagination.total} coach{pagination.total !== 1 ? 'es' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
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
      ) : coaches.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay coaches en esta categoria</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron coaches con el filtro seleccionado.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => {
            const statusConfig = STATUS_CONFIG[coach.verificationStatus]
            const isPending = coach.verificationStatus === 'PENDING_VERIFICATION'
            const isActioning = actionId === coach.id

            return (
              <GlassCard key={coach.id} intensity="light" padding="lg">
                <div className="space-y-4">
                  {/* Top: Name, email, status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {coach.user.name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-muted-foreground">{coach.user.email}</p>
                    </div>
                    <GlassBadge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </GlassBadge>
                  </div>

                  {/* Headline */}
                  {coach.headline && (
                    <p className="text-sm font-medium text-foreground/80">{coach.headline}</p>
                  )}

                  {/* Certifications */}
                  {coach.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {coach.certifications.map((cert, i) => (
                        <GlassBadge key={i} variant="primary" size="sm">
                          {cert}
                        </GlassBadge>
                      ))}
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                    {coach.yearsExperience != null && (
                      <div>
                        <span className="text-muted-foreground">Experiencia: </span>
                        <span className="font-medium">{coach.yearsExperience} anios</span>
                      </div>
                    )}
                    {coach.specialties.length > 0 && (
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-muted-foreground">Especialidades: </span>
                        <span className="font-medium">{coach.specialties.join(', ')}</span>
                      </div>
                    )}
                    {(coach.city || coach.country) && (
                      <div>
                        <span className="text-muted-foreground">Ubicacion: </span>
                        <span className="font-medium">
                          {[coach.city, coach.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {coach.hourlyRate != null && (
                      <div>
                        <span className="text-muted-foreground">Tarifa: </span>
                        <span className="font-medium">
                          {coach.currency === 'PEN' ? 'S/' : coach.currency} {coach.hourlyRate}/hr
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="font-medium">{coach.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({coach.totalReviews} resenas)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{coach._count.students}</span>
                      <span className="text-muted-foreground">estudiantes</span>
                    </div>
                  </div>

                  {/* Verification doc link */}
                  {coach.verificationDocUrl && (
                    <a
                      href={coach.verificationDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver documento de verificacion
                    </a>
                  )}

                  {/* Action buttons */}
                  {isPending && (
                    <div className="flex items-center gap-3 pt-2 border-t border-glass">
                      <GlassButton
                        variant="solid"
                        size="sm"
                        disabled={isActioning}
                        onClick={() => handleVerification(coach.id, 'VERIFIED')}
                        className="bg-green-600 hover:bg-green-700 text-white"
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
                        onClick={() => handleVerification(coach.id, 'REJECTED')}
                      >
                        {isActioning ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Rechazar
                      </GlassButton>
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
                  fetchCoaches(activeFilter, newPage)
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
                  fetchCoaches(activeFilter, newPage)
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
