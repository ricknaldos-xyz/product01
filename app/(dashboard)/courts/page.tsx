'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { MapPin, Loader2, Phone, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const DISTRICTS = [
  'Miraflores', 'San Isidro', 'San Borja', 'Surco', 'La Molina',
  'Barranco', 'San Miguel', 'Magdalena', 'Jesus Maria', 'Pueblo Libre',
  'Ate', 'La Victoria', 'Chorrillos', 'Lince',
]

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
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [district, setDistrict] = useState('')
  const [surface, setSurface] = useState('')
  const [courtType, setCourtType] = useState('')
  const [page, setPage] = useState(1)

  const fetchCourts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('city', 'Lima')
      if (district) params.set('district', district)
      if (surface) params.set('surface', surface)
      if (courtType) params.set('courtType', courtType)
      params.set('page', String(page))
      params.set('limit', '10')

      const res = await fetch(`/api/courts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCourts(data.courts || [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
    } finally {
      setLoading(false)
    }
  }, [district, surface, courtType, page])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  useEffect(() => {
    setPage(1)
  }, [district, surface, courtType])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Canchas</h1>
        </div>
        <p className="text-muted-foreground">
          Encuentra y reserva canchas de tenis cerca de ti
        </p>
      </div>

      {/* Filters */}
      <GlassCard intensity="light" padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="glass-input flex-1"
          >
            <option value="">Todos los distritos</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            className="glass-input flex-1"
          >
            <option value="">Toda superficie</option>
            {Object.entries(SURFACE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={courtType}
            onChange={(e) => setCourtType(e.target.value)}
            className="glass-input flex-1"
          >
            <option value="">Todo tipo</option>
            {Object.entries(COURT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Courts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courts.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No se encontraron canchas</h3>
            <p className="text-muted-foreground text-sm">
              Intenta ajustar los filtros para encontrar canchas disponibles.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courts.map((court) => (
            <GlassCard key={court.id} intensity="light" hover="lift" padding="none">
              <div className="flex flex-col h-full">
                {/* Image */}
                {court.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={court.imageUrl}
                      alt={court.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-video w-full rounded-t-2xl bg-muted/30">
                    <MapPin className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{court.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {court.address} - {court.district}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <GlassBadge variant="primary" size="sm">
                      {SURFACE_LABELS[court.surface] || court.surface}
                    </GlassBadge>
                    <GlassBadge variant="default" size="sm">
                      {COURT_TYPE_LABELS[court.courtType] || court.courtType}
                    </GlassBadge>
                  </div>

                  {/* Amenities */}
                  {court.amenities && court.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {court.amenities.slice(0, 3).map((amenity) => (
                        <GlassBadge key={amenity} variant="outline" size="sm">
                          {amenity}
                        </GlassBadge>
                      ))}
                      {court.amenities.length > 3 && (
                        <GlassBadge variant="outline" size="sm">
                          +{court.amenities.length - 3}
                        </GlassBadge>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <p className="text-xl font-bold">
                    S/ {court.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hora</span>
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2">
                    {court.whatsapp && (
                      <a
                        href={`https://wa.me/${court.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quisiera reservar una cancha')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GlassButton variant="ghost" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          WhatsApp
                        </GlassButton>
                      </a>
                    )}
                    <Link href={`/courts/${court.id}`} className="flex-1">
                      <GlassButton variant="solid" size="sm" className="w-full">
                        Ver disponibilidad
                      </GlassButton>
                    </Link>
                  </div>
                </div>
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
