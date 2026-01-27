'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, MapPin } from 'lucide-react'
import { getDepartmentNames, getCitiesByDepartment } from '@/lib/peru-locations'
import { useGeolocation } from '@/hooks/useGeolocation'

interface ProfileSetupFormProps {
  initialData?: {
    displayName?: string | null
    region?: string | null
    city?: string | null
    playStyle?: string | null
    dominantHand?: string | null
    backhandType?: string | null
    yearsPlaying?: number | null
    ageGroup?: string | null
    latitude?: number | null
    longitude?: number | null
  }
  isEdit?: boolean
}

const PLAY_STYLES = [
  'Baseliner agresivo',
  'Baseliner defensivo',
  'Saque y red',
  'All-court',
  'Contraatacante',
]

const AGE_GROUPS = [
  { value: 'sub18', label: 'Sub 18' },
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-45', label: '36-45' },
  { value: '46-55', label: '46-55' },
  { value: '56+', label: '56+' },
]

export function ProfileSetupForm({ initialData, isEdit }: ProfileSetupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { latitude, longitude, isLoading: geoLoading, requestLocation } = useGeolocation()

  const [formData, setFormData] = useState({
    displayName: initialData?.displayName || '',
    region: initialData?.region || '',
    city: initialData?.city || '',
    playStyle: initialData?.playStyle || '',
    dominantHand: initialData?.dominantHand || '',
    backhandType: initialData?.backhandType || '',
    yearsPlaying: initialData?.yearsPlaying?.toString() || '',
    ageGroup: initialData?.ageGroup || '',
  })

  const departments = getDepartmentNames()
  const cities = formData.region ? getCitiesByDepartment(formData.region) : []

  function updateField(field: string, value: string) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'region') {
        next.city = ''
      }
      return next
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        displayName: formData.displayName,
        region: formData.region,
        city: formData.city,
        playStyle: formData.playStyle || undefined,
        dominantHand: formData.dominantHand || undefined,
        backhandType: formData.backhandType || undefined,
        yearsPlaying: formData.yearsPlaying ? parseInt(formData.yearsPlaying) : undefined,
        ageGroup: formData.ageGroup || undefined,
        latitude: latitude ?? initialData?.latitude ?? undefined,
        longitude: longitude ?? initialData?.longitude ?? undefined,
      }

      const url = isEdit ? '/api/player/profile' : '/api/player/profile/setup'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar perfil')
        return
      }

      toast.success(isEdit ? 'Perfil actualizado' : 'Perfil creado exitosamente')
      router.push('/profile/player')
      router.refresh()
    } catch {
      toast.error('Error al guardar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard intensity="light" padding="xl">
      <h2 className="text-xl font-bold mb-6">
        {isEdit ? 'Editar perfil de jugador' : 'Completa tu perfil de jugador'}
      </h2>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre de jugador</Label>
          <GlassInput
            id="displayName"
            value={formData.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            placeholder="Tu nombre en la plataforma"
            required
            disabled={isLoading}
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="region">Departamento</Label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => updateField('region', e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-11 rounded-xl glass-light border border-glass px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecciona...</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              required
              disabled={isLoading || !formData.region}
              className="w-full h-11 rounded-xl glass-light border border-glass px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecciona...</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GPS */}
        <div className="space-y-2">
          <GlassButton
            type="button"
            variant="outline"
            onClick={requestLocation}
            disabled={geoLoading || isLoading}
            className="w-full"
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            {latitude ? 'Ubicacion obtenida' : 'Usar mi ubicacion (opcional)'}
          </GlassButton>
          {latitude && (
            <p className="text-xs text-muted-foreground text-center">
              GPS activado - mejora la precision del matchmaking
            </p>
          )}
        </div>

        {/* Play Style */}
        <div className="space-y-2">
          <Label htmlFor="playStyle">Estilo de juego</Label>
          <select
            id="playStyle"
            value={formData.playStyle}
            onChange={(e) => updateField('playStyle', e.target.value)}
            disabled={isLoading}
            className="w-full h-11 rounded-xl glass-light border border-glass px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Selecciona (opcional)...</option>
            {PLAY_STYLES.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        {/* Hand & Backhand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mano dominante</Label>
            <div className="flex gap-2">
              {[
                { value: 'right', label: 'Derecha' },
                { value: 'left', label: 'Izquierda' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('dominantHand', opt.value)}
                  disabled={isLoading}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.dominantHand === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-glass bg-glass-light text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de reves</Label>
            <div className="flex gap-2">
              {[
                { value: 'one-handed', label: '1 mano' },
                { value: 'two-handed', label: '2 manos' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('backhandType', opt.value)}
                  disabled={isLoading}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.backhandType === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-glass bg-glass-light text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Years Playing & Age Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearsPlaying">Anos jugando</Label>
            <GlassInput
              id="yearsPlaying"
              type="number"
              min="0"
              max="80"
              value={formData.yearsPlaying}
              onChange={(e) => updateField('yearsPlaying', e.target.value)}
              placeholder="Ej: 5"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageGroup">Grupo de edad</Label>
            <select
              id="ageGroup"
              value={formData.ageGroup}
              onChange={(e) => updateField('ageGroup', e.target.value)}
              disabled={isLoading}
              className="w-full h-11 rounded-xl glass-light border border-glass px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecciona...</option>
              {AGE_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEdit ? (
            'Guardar cambios'
          ) : (
            'Completar perfil'
          )}
        </GlassButton>
      </form>
    </GlassCard>
  )
}
