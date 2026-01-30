'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

const DISTRICTS = [
  'Miraflores', 'San Isidro', 'San Borja', 'Surco', 'La Molina',
  'Barranco', 'San Miguel', 'Magdalena', 'Jesus Maria', 'Pueblo Libre',
  'Ate', 'La Victoria', 'Chorrillos', 'Lince',
]

const SURFACE_OPTIONS = [
  { value: 'HARD', label: 'Dura' },
  { value: 'CLAY', label: 'Arcilla' },
  { value: 'GRASS', label: 'Cesped' },
  { value: 'SYNTHETIC', label: 'Sintetica' },
]

const COURT_TYPE_OPTIONS = [
  { value: 'INDOOR', label: 'Techada' },
  { value: 'OUTDOOR', label: 'Aire libre' },
  { value: 'COVERED', label: 'Semi-techada' },
]

interface FormData {
  name: string
  description: string
  address: string
  district: string
  city: string
  surface: string
  courtType: string
  hourlyRate: string
  phone: string
  whatsapp: string
  imageUrl: string
  amenities: string
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  address: '',
  district: '',
  city: 'Lima',
  surface: 'HARD',
  courtType: 'OUTDOOR',
  hourlyRate: '',
  phone: '',
  whatsapp: '',
  imageUrl: '',
  amenities: '',
}

export default function NewCourtPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.address || !form.district) {
      toast.error('Nombre, direccion y distrito son obligatorios')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        address: form.address,
        district: form.district,
        city: form.city || 'Lima',
        surface: form.surface,
        courtType: form.courtType,
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        currency: 'PEN',
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        imageUrl: form.imageUrl || undefined,
        amenities: form.amenities
          ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      }
      const res = await fetch('/api/provider/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Cancha creada exitosamente')
        router.push('/provider/courts')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al crear la cancha')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/provider/courts">
          <GlassButton variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </GlassButton>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Crear nueva cancha</h1>
      </div>

      {/* Form */}
      <GlassCard intensity="light" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nombre *
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Club Tennis Lima"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Direccion *
              </label>
              <input
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                placeholder="Av. El Golf 123"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Distrito *
              </label>
              <select
                value={form.district}
                onChange={(e) => handleChange('district', e.target.value)}
                required
                className="glass-input w-full"
              >
                <option value="">Seleccionar distrito</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ciudad
              </label>
              <input
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Lima"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Superficie
              </label>
              <select
                value={form.surface}
                onChange={(e) => handleChange('surface', e.target.value)}
                className="glass-input w-full"
              >
                {SURFACE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tipo de cancha
              </label>
              <select
                value={form.courtType}
                onChange={(e) => handleChange('courtType', e.target.value)}
                className="glass-input w-full"
              >
                {COURT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tarifa por hora (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.hourlyRate}
                onChange={(e) => handleChange('hourlyRate', e.target.value)}
                placeholder="50.00"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Telefono
              </label>
              <input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+51 999 999 999"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                WhatsApp
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+51999999999"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                URL de imagen
              </label>
              <input
                value={form.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/court.jpg"
                className="glass-input w-full"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Descripcion
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripcion de la cancha..."
                rows={3}
                className="glass-input w-full resize-none"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amenidades (separadas por coma)
              </label>
              <input
                value={form.amenities}
                onChange={(e) => handleChange('amenities', e.target.value)}
                placeholder="Estacionamiento, Duchas, Iluminacion, Cafeteria"
                className="glass-input w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton
              type="submit"
              variant="solid"
              size="lg"
              disabled={submitting}
              className="flex-1 sm:flex-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Cancha
                </>
              )}
            </GlassButton>
            <Link href="/provider/courts">
              <GlassButton type="button" variant="ghost" size="lg">
                Cancelar
              </GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
