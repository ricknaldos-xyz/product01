'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'
import { useSport } from '@/contexts/SportContext'

const tierOptions: { value: SkillTier; label: string }[] = [
  { value: 'UNRANKED', label: 'Sin clasificar' },
  { value: 'QUINTA_B', label: '5ta B' },
  { value: 'QUINTA_A', label: '5ta A' },
  { value: 'CUARTA_B', label: '4ta B' },
  { value: 'CUARTA_A', label: '4ta A' },
  { value: 'TERCERA_B', label: '3ra B' },
  { value: 'TERCERA_A', label: '3ra A' },
  { value: 'SEGUNDA_B', label: '2da B' },
  { value: 'SEGUNDA_A', label: '2da A' },
  { value: 'PRIMERA_B', label: '1ra B' },
  { value: 'PRIMERA_A', label: '1ra A' },
]

export default function CreateTournamentPage() {
  const router = useRouter()
  const { activeSport } = useSport()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    format: 'SINGLE_ELIMINATION',
    maxPlayers: 16,
    minTier: '',
    maxTier: '',
    registrationEnd: '',
    startDate: '',
    venue: '',
    city: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maxPlayers' ? parseInt(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.registrationEnd || !form.startDate) {
      toast.error('Completa los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      const body = {
        ...form,
        minTier: form.minTier || undefined,
        maxTier: form.maxTier || undefined,
        venue: form.venue || undefined,
        city: form.city || undefined,
        description: form.description || undefined,
        sportSlug: activeSport?.slug || 'tennis',
      }

      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const tournament = await res.json()
        toast.success('Torneo creado exitosamente')
        router.push(`/tournaments/${tournament.id}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al crear el torneo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/tournaments" className="hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Torneos
        </Link>
        <span>/</span>
        <span className="text-foreground">Crear torneo</span>
      </div>

      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-yellow-500" />
        <h1 className="text-2xl font-bold">Crear torneo</h1>
      </div>

      <GlassCard intensity="medium" padding="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del torneo *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Torneo Club San Isidro"
              className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Descripcion
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe tu torneo..."
              rows={3}
              className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Format & Max Players */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="format" className="text-sm font-medium">
                Formato
              </label>
              <select
                id="format"
                name="format"
                value={form.format}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="SINGLE_ELIMINATION">Eliminacion simple</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="maxPlayers" className="text-sm font-medium">
                Jugadores maximos
              </label>
              <select
                id="maxPlayers"
                name="maxPlayers"
                value={form.maxPlayers}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={8}>8 jugadores</option>
                <option value={16}>16 jugadores</option>
                <option value={32}>32 jugadores</option>
              </select>
            </div>
          </div>

          {/* Tier restrictions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="minTier" className="text-sm font-medium">
                Tier minimo (opcional)
              </label>
              <select
                id="minTier"
                name="minTier"
                value={form.minTier}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin restriccion</option>
                {tierOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="maxTier" className="text-sm font-medium">
                Tier maximo (opcional)
              </label>
              <select
                id="maxTier"
                name="maxTier"
                value={form.maxTier}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin restriccion</option>
                {tierOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="registrationEnd" className="text-sm font-medium">
                Cierre de inscripcion *
              </label>
              <input
                id="registrationEnd"
                name="registrationEnd"
                type="datetime-local"
                required
                value={form.registrationEnd}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-sm font-medium">
                Fecha de inicio *
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                required
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Venue & City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="venue" className="text-sm font-medium">
                Sede
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                value={form.venue}
                onChange={handleChange}
                placeholder="Ej: Club Tennis Lima"
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-sm font-medium">
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Ej: Lima"
                className="w-full rounded-xl border border-glass bg-white/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <GlassButton variant="outline" type="button" asChild>
              <Link href="/tournaments">Cancelar</Link>
            </GlassButton>
            <GlassButton variant="solid" type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trophy className="h-4 w-4 mr-2" />
              )}
              Crear torneo
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
