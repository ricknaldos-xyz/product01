'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  Shield, Loader2, Plus, Trash2, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight,
} from 'lucide-react'
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

const SURFACE_LABELS: Record<string, string> = {
  HARD: 'Dura',
  CLAY: 'Arcilla',
  GRASS: 'Cesped',
  SYNTHETIC: 'Sintetica',
}

interface Court {
  id: string
  name: string
  address: string
  district: string
  surface: string
  courtType: string
  hourlyRate: number
  isActive: boolean
  _count?: { bookings: number }
}

interface FormData {
  name: string
  description: string
  address: string
  district: string
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
  surface: 'HARD',
  courtType: 'OUTDOOR',
  hourlyRate: '',
  phone: '',
  whatsapp: '',
  imageUrl: '',
  amenities: '',
}

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchCourts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/courts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setCourts(data.courts || [])
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (e: React.FormEvent) => {
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
        city: 'Lima',
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
      const res = await fetch('/api/admin/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Cancha creada exitosamente')
        setForm(EMPTY_FORM)
        setFormOpen(false)
        fetchCourts()
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

  const handleDelete = async (courtId: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/courts/${courtId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Cancha eliminada')
        setDeleteId(null)
        fetchCourts()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al eliminar la cancha')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (court: Court) => {
    setTogglingId(court.id)
    try {
      const res = await fetch(`/api/admin/courts/${court.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !court.isActive }),
      })
      if (res.ok) {
        toast.success(court.isActive ? 'Cancha desactivada' : 'Cancha activada')
        fetchCourts()
      } else {
        toast.error('Error al actualizar la cancha')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Gestionar Canchas</h1>
      </div>

      {/* Create form */}
      <GlassCard intensity="light" padding="lg">
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <span className="font-semibold">Crear nueva cancha</span>
          </div>
          {formOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {formOpen && (
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
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
              <div className="space-y-1.5 sm:col-span-2">
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
            <GlassButton
              type="submit"
              variant="solid"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto"
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
          </form>
        )}
      </GlassCard>

      {/* Courts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courts.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No hay canchas registradas</h3>
            <p className="text-muted-foreground text-sm">
              Crea tu primera cancha usando el formulario de arriba.
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
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Distrito
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Superficie
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Tarifa
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reservas
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courts.map((court) => (
                      <tr key={court.id} className="border-b border-glass/50 last:border-0">
                        <td className="px-4 py-3 font-medium">{court.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{court.district}</td>
                        <td className="px-4 py-3">
                          <GlassBadge variant="primary" size="sm">
                            {SURFACE_LABELS[court.surface] || court.surface}
                          </GlassBadge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">S/ {court.hourlyRate}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(court)}
                            disabled={togglingId === court.id}
                            className="inline-flex items-center gap-1"
                          >
                            {togglingId === court.id ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : court.isActive ? (
                              <ToggleRight className="h-6 w-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {court._count?.bookings ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {deleteId === court.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <GlassButton
                                variant="destructive"
                                size="sm"
                                disabled={deleting}
                                onClick={() => handleDelete(court.id)}
                              >
                                {deleting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Eliminar'
                                )}
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(null)}
                              >
                                No
                              </GlassButton>
                            </div>
                          ) : (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(court.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </GlassButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {courts.map((court) => (
              <GlassCard key={court.id} intensity="light" padding="lg">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{court.name}</h3>
                      <p className="text-sm text-muted-foreground">{court.district}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(court)}
                      disabled={togglingId === court.id}
                    >
                      {togglingId === court.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : court.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <GlassBadge variant="primary" size="sm">
                      {SURFACE_LABELS[court.surface] || court.surface}
                    </GlassBadge>
                    <span className="text-sm font-medium">S/ {court.hourlyRate}/hora</span>
                    <span className="text-xs text-muted-foreground">
                      {court._count?.bookings ?? 0} reservas
                    </span>
                  </div>

                  <div className="flex justify-end">
                    {deleteId === court.id ? (
                      <div className="flex items-center gap-2">
                        <GlassButton
                          variant="destructive"
                          size="sm"
                          disabled={deleting}
                          onClick={() => handleDelete(court.id)}
                        >
                          {deleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Eliminar'
                          )}
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(null)}
                        >
                          No
                        </GlassButton>
                      </div>
                    ) : (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(court.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </GlassButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
