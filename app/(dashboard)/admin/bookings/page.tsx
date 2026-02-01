'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { CalendarDays, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  totalCents: number | null
  notes: string | null
  court: { name: string; district: string; city: string }
  user: { name: string | null; email: string }
  createdAt: string
}

interface Court {
  id: string
  name: string
  district: string
}

const STATUS_TABS = [
  { label: 'Todas', value: '' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Por pagar', value: 'PENDING_PAYMENT' },
  { label: 'Confirmadas', value: 'CONFIRMED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Canceladas', value: 'CANCELLED' },
]

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'primary' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PENDING_PAYMENT: { label: 'Por pagar', variant: 'outline' },
  CONFIRMED: { label: 'Confirmada', variant: 'success' },
  REJECTED: { label: 'Rechazada', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'default' },
}

function formatCurrency(cents: number | null): string {
  if (cents == null) return '-'
  return `S/ ${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [courtFilter, setCourtFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasActiveFilters = courtFilter !== '' || dateFrom !== '' || dateTo !== ''

  const fetchCourts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setCourts(data.courts || [])
      }
    } catch (error) {
      logger.error('Error fetching courts:', error)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (statusFilter) params.set('status', statusFilter)
      if (courtFilter) params.set('courtId', courtFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      } else {
        toast.error('Error al cargar las reservas')
      }
    } catch (error) {
      logger.error('Error fetching bookings:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, courtFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleCourtChange = (value: string) => {
    setCourtFilter(value)
    setPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const clearFilters = () => {
    setCourtFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reservas</h1>
          <p className="text-sm text-muted-foreground">
            {total} reserva{total !== 1 ? 's' : ''} en total
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <GlassButton
            key={tab.value}
            variant={statusFilter === tab.value ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Filters */}
      <GlassCard intensity="light" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cancha
            </label>
            <select
              value={courtFilter}
              onChange={(e) => handleCourtChange(e.target.value)}
              className="glass-input w-full"
              aria-label="Filtrar por cancha"
            >
              <option value="">Todas las canchas</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} - {court.district}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="glass-input w-full"
              aria-label="Filtrar desde fecha"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="glass-input w-full"
              aria-label="Filtrar hasta fecha"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3">
            <GlassButton variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </GlassButton>
          </div>
        )}
      </GlassCard>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay reservas</h3>
            <p className="text-muted-foreground text-sm">
              No se encontraron reservas con los filtros seleccionados.
            </p>
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
                      <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha
                      </th>
                      <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Hora
                      </th>
                      <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Cancha
                      </th>
                      <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Usuario
                      </th>
                      <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Monto
                      </th>
                      <th scope="col" className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const badge = STATUS_BADGE[booking.status] || {
                        label: booking.status,
                        variant: 'default' as const,
                      }
                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-glass/50 last:border-0"
                        >
                          <td className="px-4 py-3 text-sm">
                            {formatDate(booking.date)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{booking.court.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.court.district}, {booking.court.city}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">
                                {booking.user.name || 'Sin nombre'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.user.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(booking.totalCents)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <GlassBadge variant={badge.variant} size="sm">
                              {badge.label}
                            </GlassBadge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {bookings.map((booking) => {
              const badge = STATUS_BADGE[booking.status] || {
                label: booking.status,
                variant: 'default' as const,
              }
              return (
                <GlassCard key={booking.id} intensity="light" padding="lg">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{booking.court.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.court.district}, {booking.court.city}
                        </p>
                      </div>
                      <GlassBadge variant={badge.variant} size="sm">
                        {badge.label}
                      </GlassBadge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p className="font-medium">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hora</p>
                        <p className="font-medium">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Usuario</p>
                        <p className="font-medium">
                          {booking.user.name || booking.user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Monto</p>
                        <p className="font-medium">
                          {formatCurrency(booking.totalCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
                Pagina {page} de {totalPages}
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </GlassButton>
            </div>
          )}
        </>
      )}
    </div>
  )
}
