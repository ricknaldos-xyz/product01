'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput, GlassTextarea, GlassToggle } from '@/components/ui/glass-input'
import { Settings, Loader2, Save, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface CoachFormData {
  headline: string
  bio: string
  certifications: string[]
  yearsExperience: number
  specialties: string[]
  country: string
  city: string
  hourlyRate: number
  isAvailable: boolean
}

const defaultFormData: CoachFormData = {
  headline: '',
  bio: '',
  certifications: [],
  yearsExperience: 0,
  specialties: [],
  country: '',
  city: '',
  hourlyRate: 0,
  isAvailable: true,
}

export default function CoachSettingsPage() {
  const [form, setForm] = useState<CoachFormData>(defaultFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCertification, setNewCertification] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/coach/profile')
        if (res.ok) {
          const data = await res.json()
          setForm({
            headline: data.headline || '',
            bio: data.bio || '',
            certifications: data.certifications || [],
            yearsExperience: data.yearsExperience ?? 0,
            specialties: data.specialties || [],
            country: data.country || '',
            city: data.city || '',
            hourlyRate: data.hourlyRate ?? 0,
            isAvailable: data.isAvailable ?? true,
          })
        } else {
          toast.error('Error al cargar el perfil')
        }
      } catch (err) {
        logger.error('Failed to fetch coach profile', err)
        toast.error('Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/coach/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Perfil actualizado correctamente')
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || 'Error al guardar el perfil')
      }
    } catch (err) {
      logger.error('Failed to save coach profile', err)
      toast.error('Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  function addCertification() {
    const value = newCertification.trim()
    if (!value) return
    if (form.certifications.includes(value)) {
      toast.error('Esta certificacion ya existe')
      return
    }
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, value] }))
    setNewCertification('')
  }

  function removeCertification(index: number) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  function addSpecialty() {
    const value = newSpecialty.trim()
    if (!value) return
    if (form.specialties.includes(value)) {
      toast.error('Esta especialidad ya existe')
      return
    }
    setForm((prev) => ({ ...prev, specialties: [...prev.specialties, value] }))
    setNewSpecialty('')
  }

  function removeSpecialty(index: number) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Configuracion de Coach</h1>
      </div>

      {/* Informacion basica */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Informacion basica</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titular</label>
            <GlassInput
              type="text"
              maxLength={100}
              value={form.headline}
              onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              placeholder="Ej: Entrenador profesional de tenis"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.headline.length}/100</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <GlassTextarea
              maxLength={1000}
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Describe tu experiencia y enfoque como entrenador..."
            />
            <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/1000</p>
          </div>
        </div>
      </GlassCard>

      {/* Experiencia */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Experiencia</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Anos de experiencia</label>
            <GlassInput
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  yearsExperience: parseInt(e.target.value) || 0,
                }))
              }
              className="max-w-[200px]"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium mb-1">Certificaciones</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.certifications.map((cert, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(i)}
                    className="hover:text-destructive transition-colors"
                    aria-label="Eliminar certificacion"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <GlassInput
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCertification()
                  }
                }}
                placeholder="Agregar certificacion..."
                className="flex-1"
              />
              <GlassButton type="button" variant="outline" size="sm" onClick={addCertification}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </GlassButton>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium mb-1">Especialidades</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(i)}
                    className="hover:text-destructive transition-colors"
                    aria-label="Eliminar especialidad"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <GlassInput
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSpecialty()
                  }
                }}
                placeholder="Agregar especialidad..."
                className="flex-1"
              />
              <GlassButton type="button" variant="outline" size="sm" onClick={addSpecialty}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Ubicacion y tarifa */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Ubicacion y tarifa</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Pais</label>
            <GlassInput
              type="text"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Ej: Peru"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <GlassInput
              type="text"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="Ej: Lima"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarifa por hora</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                S/
              </span>
              <GlassInput
                type="number"
                min={0}
                step="0.01"
                value={form.hourlyRate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  }))
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Disponibilidad */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Disponibilidad</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Disponible para nuevos alumnos</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Los jugadores podran encontrarte en el marketplace
            </p>
          </div>
          <GlassToggle
            checked={form.isAvailable}
            onCheckedChange={(v) => setForm(prev => ({...prev, isAvailable: v}))}
            aria-label="Disponible para nuevos alumnos"
          />
        </div>
      </GlassCard>

      {/* Save button */}
      <div className="flex justify-end">
        <GlassButton variant="solid" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar cambios
        </GlassButton>
      </div>
    </div>
  )
}
