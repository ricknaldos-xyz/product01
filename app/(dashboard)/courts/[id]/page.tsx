'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  ArrowLeft, MapPin, Phone, Globe, Clock, Loader2, Calendar,
  MessageCircle, CheckCircle,
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
  description: string | null
  address: string
  district: string
  city: string
  phone: string | null
  whatsapp: string | null
  website: string | null
  imageUrl: string | null
  surface: string
  courtType: string
  hourlyRate: number
  currency: string
  amenities: string[]
  isActive: boolean
  operatingHours: Record<string, string> | null
}

function generateTimeOptions(start: number, end: number): string[] {
  const times: string[] = []
  for (let h = start; h <= end; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`)
  }
  return times
}

export default function CourtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courtId = params.id as string

  const [court, setCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  // Booking form state
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const startTimeOptions = generateTimeOptions(7, 21)
  const endTimeOptions = startTime
    ? generateTimeOptions(parseInt(startTime.split(':')[0]) + 1, 22)
    : []

  useEffect(() => {
    const controller = new AbortController()
    async function fetchCourt() {
      try {
        const res = await fetch(`/api/courts/${courtId}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setCourt(data)
        } else {
          toast.error('No se pudo cargar la cancha')
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        toast.error('Error de conexion')
      } finally {
        setLoading(false)
      }
    }
    fetchCourt()
    return () => controller.abort()
  }, [courtId])

  useEffect(() => {
    setEndTime('')
  }, [startTime])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !startTime || !endTime) {
      toast.error('Completa la fecha y horarios')
      return
    }
    setBooking(true)
    try {
      const res = await fetch(`/api/courts/${courtId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, startTime, endTime, notes: notes || undefined }),
      })
      if (res.ok) {
        toast.success('Reserva creada exitosamente')
        router.push('/courts/bookings')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al crear la reserva')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!court) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link href="/courts">
          <GlassButton variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a canchas
          </GlassButton>
        </Link>
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Cancha no encontrada</h3>
            <p className="text-muted-foreground text-sm">
              La cancha que buscas no existe o fue eliminada.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/courts">
        <GlassButton variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a canchas
        </GlassButton>
      </Link>

      {/* Court name */}
      <h1 className="text-2xl md:text-3xl font-bold">{court.name}</h1>

      {/* Image */}
      {court.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Info grid */}
      <GlassCard intensity="light" padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Direccion</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm">{court.address}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Distrito</p>
            <p className="text-sm">{court.district}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Superficie</p>
            <GlassBadge variant="primary" size="sm">
              {SURFACE_LABELS[court.surface] || court.surface}
            </GlassBadge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</p>
            <GlassBadge variant="default" size="sm">
              {COURT_TYPE_LABELS[court.courtType] || court.courtType}
            </GlassBadge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tarifa por hora</p>
            <p className="text-xl font-bold">
              S/ {court.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hora</span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Description */}
      {court.description && (
        <GlassCard intensity="light" padding="lg">
          <p className="text-sm text-muted-foreground">{court.description}</p>
        </GlassCard>
      )}

      {/* Amenities */}
      {court.amenities && court.amenities.length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Amenidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {court.amenities.map((amenity) => (
              <GlassBadge key={amenity} variant="success" size="sm">
                {amenity}
              </GlassBadge>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Contact */}
      <GlassCard intensity="light" padding="lg">
        <h3 className="text-sm font-semibold mb-3">Contacto</h3>
        <div className="flex flex-wrap gap-3">
          {court.phone && (
            <a href={`tel:${court.phone}`}>
              <GlassButton variant="ghost" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                {court.phone}
              </GlassButton>
            </a>
          )}
          {court.whatsapp && (
            <a
              href={`https://wa.me/${court.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quisiera reservar una cancha')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlassButton variant="primary" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </GlassButton>
            </a>
          )}
          {court.website && (
            <a href={court.website} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Sitio web
              </GlassButton>
            </a>
          )}
        </div>
      </GlassCard>

      {/* Operating hours */}
      {court.operatingHours && Object.keys(court.operatingHours).length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Horario de atencion
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(court.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="font-medium capitalize">{day}</span>
                <span className="text-muted-foreground">{hours}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Booking form */}
      <GlassCard intensity="medium" padding="lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Reservar cancha
        </h3>
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fecha
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hora inicio
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="glass-input w-full min-h-[44px]"
                aria-label="Hora de inicio"
              >
                <option value="">Seleccionar</option>
                {startTimeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hora fin
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={!startTime}
                className="glass-input w-full min-h-[44px]"
                aria-label="Hora de fin"
              >
                <option value="">Seleccionar</option>
                {endTimeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ejemplo: Traeremos pelotas propias..."
              rows={3}
              className="glass-input w-full resize-none"
            />
          </div>
          <GlassButton
            type="submit"
            variant="solid"
            size="lg"
            className="w-full"
            disabled={booking}
          >
            {booking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reservando...
              </>
            ) : (
              'Reservar'
            )}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  )
}
