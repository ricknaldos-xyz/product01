'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CoachFormData {
  headline: string
  bio: string
  certifications: string[]
  specialties: string[]
  yearsExperience: number | null
  city: string
  hourlyRate: number | null
}

interface CoachSetupFormProps {
  initialData?: Partial<CoachFormData>
  onSuccess: () => void
}

export function CoachSetupForm({ initialData, onSuccess }: CoachSetupFormProps) {
  const [headline, setHeadline] = useState(initialData?.headline || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [certificationsText, setCertificationsText] = useState(
    initialData?.certifications?.join(', ') || ''
  )
  const [specialtiesText, setSpecialtiesText] = useState(
    initialData?.specialties?.join(', ') || ''
  )
  const [yearsExperience, setYearsExperience] = useState<string>(
    initialData?.yearsExperience?.toString() || ''
  )
  const [city, setCity] = useState(initialData?.city || '')
  const [hourlyRate, setHourlyRate] = useState<string>(
    initialData?.hourlyRate?.toString() || ''
  )
  const [submitting, setSubmitting] = useState(false)

  const isEditing = !!initialData

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const certifications = certificationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload: Record<string, unknown> = {
      headline: headline || undefined,
      bio: bio || undefined,
      certifications,
      specialties,
      city: city || undefined,
    }

    if (yearsExperience) {
      payload.yearsExperience = parseInt(yearsExperience, 10)
    }

    if (hourlyRate) {
      payload.hourlyRate = parseFloat(hourlyRate)
    }

    try {
      const res = await fetch('/api/coach/profile', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(
          isEditing
            ? 'Perfil actualizado correctamente'
            : 'Perfil de entrenador creado'
        )
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <h2 className="text-lg font-semibold mb-4">
        {isEditing ? 'Editar perfil de entrenador' : 'Crear perfil de entrenador'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Headline */}
        <div>
          <label className="block text-sm font-medium mb-1">Titulo profesional</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ej: Entrenador certificado de tenis"
            maxLength={100}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Biografia</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuenta sobre tu experiencia y metodologia..."
            maxLength={1000}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Certificaciones
            <span className="text-xs text-muted-foreground ml-1">
              (separadas por coma)
            </span>
          </label>
          <input
            type="text"
            value={certificationsText}
            onChange={(e) => setCertificationsText(e.target.value)}
            placeholder="Ej: ITF Nivel 1, RPT Coach"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Especialidades
            <span className="text-xs text-muted-foreground ml-1">
              (separadas por coma)
            </span>
          </label>
          <input
            type="text"
            value={specialtiesText}
            onChange={(e) => setSpecialtiesText(e.target.value)}
            placeholder="Ej: Saque, Revés, Iniciación"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Years Experience + City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Anos de experiencia
            </label>
            <input
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: Lima"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tarifa por hora (PEN)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              S/
            </span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="0"
              min={0}
              step={5}
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Submit */}
        <GlassButton
          type="submit"
          variant="solid"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear perfil'
          )}
        </GlassButton>
      </form>
    </GlassCard>
  )
}
