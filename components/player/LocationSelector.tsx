'use client'

import { useState, useCallback } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { MapPin, Loader2, Navigation } from 'lucide-react'
import { PERU_DEPARTMENTS, getCitiesByDepartment } from '@/lib/peru-locations'
import { toast } from 'sonner'

interface LocationSelectorProps {
  region: string
  city: string
  onRegionChange: (region: string) => void
  onCityChange: (city: string) => void
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
}

export function LocationSelector({
  region,
  city,
  onRegionChange,
  onCityChange,
  latitude,
  longitude,
  onLocationChange,
}: LocationSelectorProps) {
  const [geoLoading, setGeoLoading] = useState(false)
  const cities = region ? getCitiesByDepartment(region) : []

  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onRegionChange(e.target.value)
      onCityChange('')
    },
    [onRegionChange, onCityChange]
  )

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onCityChange(e.target.value)
    },
    [onCityChange]
  )

  function handleGeolocation() {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalizacion')
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude)
        setGeoLoading(false)
        toast.success('Ubicacion obtenida')
      },
      (error) => {
        setGeoLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Permiso de ubicacion denegado')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Ubicacion no disponible')
            break
          case error.TIMEOUT:
            toast.error('Tiempo de espera agotado')
            break
          default:
            toast.error('Error al obtener ubicacion')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-4">
      {/* Department */}
      <div className="space-y-1.5">
        <label htmlFor="region" className="text-sm font-medium">
          Departamento
        </label>
        <select
          id="region"
          value={region}
          onChange={handleRegionChange}
          className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Seleccionar departamento</option>
          {PERU_DEPARTMENTS.map((dept) => (
            <option key={dept.code} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label htmlFor="city" className="text-sm font-medium">
          Ciudad
        </label>
        <select
          id="city"
          value={city}
          onChange={handleCityChange}
          disabled={!region}
          className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Seleccionar ciudad</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Geolocation button */}
      <GlassButton
        variant="outline"
        type="button"
        onClick={handleGeolocation}
        disabled={geoLoading}
        className="w-full"
      >
        {geoLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4 mr-2" />
        )}
        Usar mi ubicacion
      </GlassButton>

      {/* Show coordinates if set */}
      {latitude != null && longitude != null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <MapPin className="h-3 w-3" />
          <span>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}
