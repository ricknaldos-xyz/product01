'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  Calendar, Loader2, MapPin, Clock, XCircle,
  ChevronLeft, ChevronRight, Search,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
}

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
}

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
  court: {
    id: string
    name: string
    address: string
    district: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', '10')

      const res = await fetch(`/api/courts/bookings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
      }
    } catch (error) {
      logger.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId)
    try {
      const res = await fetch('/api/courts/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      if (res.ok) {
        toast.success('Reserva cancelada')
        setConfirmCancelId(null)
        fetchBookings()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al cancelar la reserva')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setCancellingId(null)
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Calendar className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Mis Reservas</h1>
        </div>
      </div>

      {/* Filter */}
      <GlassCard intensity="light" padding="md">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="glass-input w-full sm:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </GlassCard>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No tienes reservas</h3>
            <p className="text-muted-foreground text-sm">
              Busca una cancha para reservar.
            </p>
            <Link href="/courts">
              <GlassButton variant="solid" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Ver canchas
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <GlassCard key={booking.id} intensity="light" padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.court.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.court.address} - {booking.court.district}
                      </p>
                    </div>
                    <GlassBadge variant={STATUS_VARIANTS[booking.status] || 'default'}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </GlassBadge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {booking.notes}
                    </p>
                  )}
                </div>

                {/* Cancel action */}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {confirmCancelId === booking.id ? (
                      <div className="flex gap-2">
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancel(booking.id)}
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Confirmar'
                          )}
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmCancelId(null)}
                        >
                          No
                        </GlassButton>
                      </div>
                    ) : (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmCancelId(booking.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
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
