'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Save, Loader2 } from 'lucide-react'

interface WorkshopFormData {
  name: string
  address: string
  district: string
  city: string
  phone?: string | null
  latitude: number | null
  longitude: number | null
  isPartner: boolean
  operatingHours: Record<string, string> | null
}

interface AdminWorkshopFormProps {
  initialData?: Partial<WorkshopFormData>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  loading: boolean
}

const LIMA_DISTRICTS = [
  'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos',
  'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesus Maria',
  'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurigancho',
  'Lurin', 'Magdalena del Mar', 'Miraflores', 'Pachacamac', 'Pucusana',
  'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra',
  'Rimac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
  'San Juan de Miraflores', 'San Luis', 'San Martin de Porres',
  'San Miguel', 'Santa Anita', 'Santa Maria del Mar', 'Santa Rosa',
  'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa Maria del Triunfo',
]

const DAYS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miercoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sabado' },
  { key: 'dom', label: 'Domingo' },
]

export default function AdminWorkshopForm({ initialData, onSubmit, loading }: AdminWorkshopFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [district, setDistrict] = useState(initialData?.district || '')
  const [city, setCity] = useState(initialData?.city || 'Lima')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '')
  const [isPartner, setIsPartner] = useState(initialData?.isPartner ?? false)
  const [hours, setHours] = useState<Record<string, string>>(
    (initialData?.operatingHours as Record<string, string>) || {}
  )

  const updateHour = (day: string, value: string) => {
    setHours({ ...hours, [day]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filteredHours: Record<string, string> = {}
    Object.entries(hours).forEach(([key, value]) => {
      if (value.trim()) {
        filteredHours[key] = value.trim()
      }
    })

    await onSubmit({
      name,
      address,
      district,
      city,
      phone: phone || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      isPartner,
      operatingHours: Object.keys(filteredHours).length > 0 ? filteredHours : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Informacion del taller</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Direccion *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distrito *</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="glass-input w-full"
              required
            >
              <option value="">Seleccionar distrito</option>
              {LIMA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Latitud</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitud</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPartner}
                onChange={(e) => setIsPartner(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Taller asociado (partner)</span>
            </label>
          </div>
        </div>
      </GlassCard>

      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Horario de atencion</h3>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div key={day.key} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{day.label}</span>
              <input
                type="text"
                placeholder="ej: 9:00-18:00"
                value={hours[day.key] || ''}
                onChange={(e) => updateHour(day.key, e.target.value)}
                className="glass-input flex-1"
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton type="submit" variant="solid" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar taller
            </>
          )}
        </GlassButton>
      </div>
    </form>
  )
}
