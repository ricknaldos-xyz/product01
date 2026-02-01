'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassInput, GlassToggle } from '@/components/ui/glass-input'
import { ArrowLeft, Loader2, Save, ClipboardList } from 'lucide-react'

interface Workshop {
  id: string
  name: string
  address: string
  district: string
  city: string
  phone: string | null
  isActive: boolean
  isPartner: boolean
  operatingHours: Record<string, string> | null
  _count: { stringingOrders: number }
}

const DAYS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miercoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sabado' },
  { key: 'dom', label: 'Domingo' },
]

export default function ProviderWorkshopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    district: '',
    city: '',
    phone: '',
    isActive: true,
  })
  const [hours, setHours] = useState<Record<string, string>>({
    lun: '',
    mar: '',
    mie: '',
    jue: '',
    vie: '',
    sab: '',
    dom: '',
  })

  const fetchWorkshop = useCallback(async () => {
    try {
      const res = await fetch(`/api/provider/workshops/${id}`)
      if (res.ok) {
        const data: Workshop = await res.json()
        setWorkshop(data)
        setForm({
          name: data.name,
          address: data.address,
          district: data.district,
          city: data.city,
          phone: data.phone || '',
          isActive: data.isActive,
        })
        if (data.operatingHours) {
          setHours({
            lun: data.operatingHours.lun || '',
            mar: data.operatingHours.mar || '',
            mie: data.operatingHours.mie || '',
            jue: data.operatingHours.jue || '',
            vie: data.operatingHours.vie || '',
            sab: data.operatingHours.sab || '',
            dom: data.operatingHours.dom || '',
          })
        }
      } else {
        toast.error('Taller no encontrado')
        router.push('/provider/workshops')
      }
    } catch {
      toast.error('Error al cargar taller')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchWorkshop()
  }, [fetchWorkshop])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleHourChange = (day: string, value: string) => {
    setHours({ ...hours, [day]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const operatingHours: Record<string, string> = {}
      for (const [key, value] of Object.entries(hours)) {
        if (value.trim()) {
          operatingHours[key] = value.trim()
        }
      }

      const res = await fetch(`/api/provider/workshops/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          district: form.district,
          city: form.city,
          phone: form.phone || null,
          isActive: form.isActive,
          operatingHours: Object.keys(operatingHours).length > 0 ? operatingHours : null,
        }),
      })

      if (res.ok) {
        toast.success('Taller actualizado correctamente')
        fetchWorkshop()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar taller')
      }
    } catch {
      toast.error('Error al actualizar taller')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workshop) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={() => router.push('/provider/workshops')} aria-label="Volver a talleres">
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
          <div>
            <h1 className="text-2xl font-bold">{workshop.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <GlassBadge variant={workshop.isActive ? 'success' : 'destructive'}>
                {workshop.isActive ? 'Activo' : 'Inactivo'}
              </GlassBadge>
              <span className="text-muted-foreground text-sm">
                {workshop._count.stringingOrders} ordenes
              </span>
            </div>
          </div>
        </div>
        <GlassButton
          variant="primary"
          onClick={() => router.push(`/provider/workshops/${id}/orders`)}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Ver pedidos
        </GlassButton>
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard intensity="medium">
          <h3 className="text-lg font-semibold mb-4">Editar informacion</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del taller *</label>
              <GlassInput
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Direccion *</label>
              <GlassInput
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Distrito *</label>
                <GlassInput
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <GlassInput
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefono</label>
              <GlassInput
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-3">
              <GlassToggle
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                aria-label="Taller activo"
              />
              <span className="text-sm font-medium">
                Taller activo
              </span>
            </div>

            {/* Operating hours */}
            <div>
              <label className="block text-sm font-medium mb-2">Horario de atencion</label>
              <div className="space-y-2">
                {DAYS.map((day) => (
                  <div key={day.key} className="flex items-center gap-3">
                    <span className="text-sm w-24">{day.label}</span>
                    <GlassInput
                      type="text"
                      value={hours[day.key]}
                      onChange={(e) => handleHourChange(day.key, e.target.value)}
                      className="flex-1"
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
              Guardar cambios
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </div>
  )
}
