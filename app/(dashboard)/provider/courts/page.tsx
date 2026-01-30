'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Building2, Loader2, Plus, MapPin, Calendar,
  ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

const SURFACE_LABELS: Record<string, string> = {
  HARD: 'Dura',
  CLAY: 'Arcilla',
  GRASS: 'Cesped',
  SYNTHETIC: 'Sintetica',
}

const COURT_TYPE_LABELS: Record<string, string> = {
  INDOOR: 'Techada',
  OUTDOOR: 'Aire libre',
  COVERED: 'Semi-techada',
}

interface Court {
  id: string
  name: string
  address: string
  district: string
  surface: string
  courtType: string
  hourlyRate: number
  isActive: boolean
  _count?: { bookings: number }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ProviderCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchCourts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/provider/courts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCourts(data.courts || [])
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (error) {
      logger.error('Error fetching provider courts:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  const handleToggleActive = async (court: Court) => {
    setTogglingId(court.id)
    try {
      const res = await fetch(`/api/provider/courts/${court.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !court.isActive }),
      })
      if (res.ok) {
        toast.success(court.isActive ? 'Cancha desactivada' : 'Cancha activada')
        fetchCourts()
      } else {
        toast.error('Error al actualizar la cancha')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Mis Canchas</h1>
        </div>
        <Link href="/provider/courts/new">
          <GlassButton variant="solid" size="default">
            <Plus className="h-4 w-4 mr-2" />
            Crear cancha
          </GlassButton>
        </Link>
      </div>

      {/* Courts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courts.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No tienes canchas registradas</h3>
            <p className="text-muted-foreground text-sm">
              Crea tu primera cancha para empezar a recibir reservas.
            </p>
            <Link href="/provider/courts/new">
              <GlassButton variant="solid" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear cancha
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <GlassCard intensity="light" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Distrito
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Superficie
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Tarifa
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reservas
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courts.map((court) => (
                      <tr key={court.id} className="border-b border-glass/50 last:border-0">
                        <td className="px-4 py-3">
                          <Link
                            href={`/provider/courts/${court.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {court.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {court.district}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <GlassBadge variant="primary" size="sm">
                            {SURFACE_LABELS[court.surface] || court.surface}
                          </GlassBadge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">S/ {court.hourlyRate}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(court)}
                            disabled={togglingId === court.id}
                            className="inline-flex items-center gap-1"
                          >
                            {togglingId === court.id ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : court.isActive ? (
                              <ToggleRight className="h-6 w-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {court._count?.bookings ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/provider/courts/${court.id}/bookings`}>
                              <GlassButton variant="ghost" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Reservas
                              </GlassButton>
                            </Link>
                            <Link href={`/provider/courts/${court.id}`}>
                              <GlassButton variant="ghost" size="sm">
                                Editar
                              </GlassButton>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {courts.map((court) => (
              <GlassCard key={court.id} intensity="light" padding="lg">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/provider/courts/${court.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {court.name}
                      </Link>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {court.address} - {court.district}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(court)}
                      disabled={togglingId === court.id}
                    >
                      {togglingId === court.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : court.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <GlassBadge variant="primary" size="sm">
                      {SURFACE_LABELS[court.surface] || court.surface}
                    </GlassBadge>
                    <GlassBadge variant="default" size="sm">
                      {COURT_TYPE_LABELS[court.courtType] || court.courtType}
                    </GlassBadge>
                    <span className="text-sm font-medium">S/ {court.hourlyRate}/hora</span>
                    <span className="text-xs text-muted-foreground">
                      {court._count?.bookings ?? 0} reservas
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/provider/courts/${court.id}/bookings`} className="flex-1">
                      <GlassButton variant="solid" size="sm" className="w-full">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reservas
                      </GlassButton>
                    </Link>
                    <Link href={`/provider/courts/${court.id}`}>
                      <GlassButton variant="ghost" size="sm">
                        Editar
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <GlassButton
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </GlassButton>
          <span className="text-sm text-muted-foreground">
            Pagina {pagination.page} de {pagination.totalPages}
          </span>
          <GlassButton
            variant="ghost"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </GlassButton>
        </div>
      )}
    </div>
  )
}
