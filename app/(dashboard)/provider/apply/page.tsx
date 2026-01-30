'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Building2, Loader2, CheckCircle, Clock, XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

type ProviderType = 'COURT' | 'WORKSHOP'
type ProviderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

interface ProviderApplication {
  id: string
  type: ProviderType
  status: ProviderStatus
  businessName: string
  businessPhone: string
  businessEmail: string | null
  description: string | null
  reviewNotes: string | null
  createdAt: string
}

const STATUS_CONFIG: Record<ProviderStatus, { label: string; variant: 'warning' | 'success' | 'destructive' | 'default'; icon: typeof Clock }> = {
  PENDING_APPROVAL: { label: 'Pendiente', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Aprobado', variant: 'success', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', variant: 'destructive', icon: XCircle },
  SUSPENDED: { label: 'Suspendido', variant: 'default', icon: XCircle },
}

const TYPE_LABELS: Record<ProviderType, string> = {
  COURT: 'Cancha',
  WORKSHOP: 'Taller',
}

export default function ProviderApplyPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [type, setType] = useState<ProviderType>('COURT')
  const [businessName, setBusinessName] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/provider/status')
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      }
    } catch (error) {
      logger.error('Error fetching provider status:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasApplicationForType = (t: ProviderType) =>
    applications.some((app) => app.type === t)

  const canApplyForType = (t: ProviderType) => !hasApplicationForType(t)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessName.trim() || !businessPhone.trim()) {
      toast.error('Completa los campos obligatorios')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/provider/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          businessName: businessName.trim(),
          businessPhone: businessPhone.trim(),
          businessEmail: businessEmail.trim() || undefined,
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Solicitud enviada exitosamente')
        router.push('/provider')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al enviar solicitud')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Solicitud de Proveedor</h1>
        </div>
        <GlassCard intensity="light" padding="xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Solicitud de Proveedor</h1>
      </div>

      {/* Existing applications */}
      {applications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Tus solicitudes</h2>
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status]
            const Icon = config.icon
            return (
              <GlassCard key={app.id} intensity="light" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{app.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        {TYPE_LABELS[app.type]} - {new Date(app.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                  <GlassBadge variant={config.variant}>{config.label}</GlassBadge>
                </div>
                {app.status === 'REJECTED' && app.reviewNotes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Motivo: {app.reviewNotes}
                  </p>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Application form */}
      {(canApplyForType('COURT') || canApplyForType('WORKSHOP')) ? (
        <GlassCard intensity="light" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold">Nueva solicitud</h2>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de proveedor *</label>
              <div className="flex gap-3">
                {(['COURT', 'WORKSHOP'] as ProviderType[]).map((t) => {
                  const disabled = !canApplyForType(t)
                  return (
                    <GlassButton
                      key={t}
                      type="button"
                      variant={type === t ? 'solid' : 'ghost'}
                      size="sm"
                      disabled={disabled}
                      onClick={() => setType(t)}
                    >
                      {TYPE_LABELS[t]}
                      {disabled && ' (ya solicitado)'}
                    </GlassButton>
                  )
                })}
              </div>
            </div>

            {/* Business name */}
            <div className="space-y-2">
              <label htmlFor="businessName" className="text-sm font-medium">
                Nombre del negocio *
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Club Deportivo Los Olivos"
                required
                className="w-full rounded-xl border border-glass bg-glass-light px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Business phone */}
            <div className="space-y-2">
              <label htmlFor="businessPhone" className="text-sm font-medium">
                Telefono de contacto *
              </label>
              <input
                id="businessPhone"
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="Ej: 999 123 456"
                required
                className="w-full rounded-xl border border-glass bg-glass-light px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Business email */}
            <div className="space-y-2">
              <label htmlFor="businessEmail" className="text-sm font-medium">
                Email del negocio (opcional)
              </label>
              <input
                id="businessEmail"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="contacto@minegocio.com"
                className="w-full rounded-xl border border-glass bg-glass-light px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripcion (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu negocio, servicios que ofreces, ubicacion, etc."
                rows={4}
                className="w-full rounded-xl border border-glass bg-glass-light px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Submit */}
            <GlassButton
              type="submit"
              variant="solid"
              disabled={submitting || !canApplyForType(type)}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar solicitud'
              )}
            </GlassButton>
          </form>
        </GlassCard>
      ) : (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Ya has solicitado todos los tipos disponibles</h3>
            <p className="text-muted-foreground text-sm">
              Puedes ver el estado de tus solicitudes arriba.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
