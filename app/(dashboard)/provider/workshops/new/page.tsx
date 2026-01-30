'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const DAYS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miercoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sabado' },
  { key: 'dom', label: 'Domingo' },
]

export default function ProviderNewWorkshopPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    district: '',
    city: 'Lima',
    phone: '',
  })
  const [hours, setHours] = useState<Record<string, string>>({
    lun: '09:00-18:00',
    mar: '09:00-18:00',
    mie: '09:00-18:00',
    jue: '09:00-18:00',
    vie: '09:00-18:00',
    sab: '09:00-14:00',
    dom: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleHourChange = (day: string, value: string) => {
    setHours({ ...hours, [day]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Build operating hours, omit empty days
      const operatingHours: Record<string, string> = {}
      for (const [key, value] of Object.entries(hours)) {
        if (value.trim()) {
          operatingHours[key] = value.trim()
        }
      }

      const res = await fetch('/api/provider/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : undefined,
        }),
      })

      if (res.ok) {
        toast.success('Taller creado correctamente')
        router.push('/provider/workshops')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear taller')
      }
    } catch {
      toast.error('Error al crear taller')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/provider/workshops')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Nuevo taller</h1>
          <p className="text-muted-foreground text-sm">
            Registra un nuevo taller de encordado
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard intensity="medium">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del taller *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="glass-input w-full"
                placeholder="Ej: Taller de encordado Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Direccion *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="glass-input w-full"
                placeholder="Ej: Av. Javier Prado 1234"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Distrito *</label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="glass-input w-full"
                  placeholder="Ej: San Isidro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="glass-input w-full"
                  placeholder="Lima"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="glass-input w-full"
                placeholder="Ej: 999 888 777"
              />
            </div>

            {/* Operating hours */}
            <div>
              <label className="block text-sm font-medium mb-2">Horario de atencion</label>
              <div className="space-y-2">
                {DAYS.map((day) => (
                  <div key={day.key} className="flex items-center gap-3">
                    <span className="text-sm w-24">{day.label}</span>
                    <input
                      type="text"
                      value={hours[day.key]}
                      onChange={(e) => handleHourChange(day.key, e.target.value)}
                      className="glass-input flex-1"
                      placeholder="Ej: 09:00-18:00 (vacio = cerrado)"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Formato: HH:MM-HH:MM. Dejar vacio si esta cerrado ese dia.
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <GlassButton type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Crear taller
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </div>
  )
}
