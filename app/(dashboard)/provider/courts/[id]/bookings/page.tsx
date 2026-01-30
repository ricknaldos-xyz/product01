'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  ArrowLeft, Loader2, Calendar, Clock, User,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Search,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
}

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive' | 'primary' | 'default'> = {
  PENDING: 'warning',
  PENDING_PAYMENT: 'primary',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'destructive',
}

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PENDING_PAYMENT', label: 'Por pagar' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
  confirmationNote: string | null
  totalCents: number | null
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CourtBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState<string | null>(null)
  const [confirmNote, setConfirmNote] = useState('')
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/provider/courts/${id}/bookings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (error) {
      logger.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [id, statusFilter, page])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const handleAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    setActionId(bookingId)
    try {
      const body: Record<string, unknown> = { action }
      if (confirmNote.trim()) {
        body.confirmationNote = confirmNote.trim()
      }

      const res = await fetch(`/api/provider/courts/${id}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(action === 'confirm' ? 'Reserva confirmada' : 'Reserva rechazada')
        setShowNoteFor(null)
        setConfirmNote('')
        fetchBookings()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al procesar la reserva')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setActionId(null)
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-PE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/provider/courts/${id}`}>
          <GlassButton variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </GlassButton>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reservas</h1>
          <p className="text-sm text-muted-foreground">Gestiona las reservas de tu cancha</p>
        </div>
      </div>

      {/* Status tabs */}
      <GlassCard intensity="light" padding="md">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <GlassButton
              key={tab.value}
              variant={statusFilter === tab.value ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </GlassButton>
          ))}
        </div>
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
            <h3 className="text-lg font-semibold">No hay reservas</h3>
            <p className="text-muted-foreground text-sm">
              {statusFilter
                ? 'No se encontraron reservas con este filtro.'
                : 'Aun no tienes reservas para esta cancha.'}
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <GlassCard key={booking.id} intensity="light" padding="lg">
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {booking.user.name || 'Sin nombre'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                  </div>
                  <GlassBadge variant={STATUS_VARIANTS[booking.status] || 'default'}>
                    {STATUS_LABELS[booking.status] || booking.status}
                  </GlassBadge>
                </div>

                {/* Date and time */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(booking.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {booking.startTime} - {booking.endTime}
                  </span>
                  {booking.totalCents != null && (
                    <span className="font-medium">
                      S/ {(booking.totalCents / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {booking.notes && (
                  <p className="text-sm text-muted-foreground italic">
                    Nota del jugador: {booking.notes}
                  </p>
                )}
                {booking.confirmationNote && (
                  <p className="text-sm text-muted-foreground italic">
                    Tu nota: {booking.confirmationNote}
                  </p>
                )}

                {/* Actions for PENDING bookings */}
                {booking.status === 'PENDING' && (
                  <div className="pt-2 border-t border-glass/50">
                    {showNoteFor === booking.id ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Nota (opcional)
                          </label>
                          <input
                            value={confirmNote}
                            onChange={(e) => setConfirmNote(e.target.value)}
                            placeholder="Mensaje para el jugador..."
                            className="glass-input w-full"
                          />
                        </div>
                        <div className="flex gap-2">
                          <GlassButton
                            variant="solid"
                            size="sm"
                            disabled={actionId === booking.id}
                            onClick={() => handleAction(booking.id, 'confirm')}
                          >
                            {actionId === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </>
                            )}
                          </GlassButton>
                          <GlassButton
                            variant="destructive"
                            size="sm"
                            disabled={actionId === booking.id}
                            onClick={() => handleAction(booking.id, 'reject')}
                          >
                            {actionId === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Rechazar
                              </>
                            )}
                          </GlassButton>
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNoteFor(null)
                              setConfirmNote('')
                            }}
                          >
                            Cancelar
                          </GlassButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <GlassButton
                          variant="solid"
                          size="sm"
                          onClick={() => setShowNoteFor(booking.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </GlassButton>
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowNoteFor(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </GlassButton>
                      </div>
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
