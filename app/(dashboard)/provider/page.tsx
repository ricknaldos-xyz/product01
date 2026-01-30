'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import {
  Building2, Loader2, CheckCircle, Clock, XCircle,
  MapPin, Wrench, Plus, ArrowRight,
} from 'lucide-react'

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
  PENDING_APPROVAL: { label: 'Pendiente de aprobacion', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Aprobado', variant: 'success', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', variant: 'destructive', icon: XCircle },
  SUSPENDED: { label: 'Suspendido', variant: 'default', icon: XCircle },
}

export default function ProviderHubPage() {
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
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
    fetchStatus()
  }, [])

  const approvedCourt = applications.find(
    (a) => a.type === 'COURT' && a.status === 'APPROVED'
  )
  const approvedWorkshop = applications.find(
    (a) => a.type === 'WORKSHOP' && a.status === 'APPROVED'
  )
  const hasAnyApplication = applications.length > 0

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Panel de Proveedor</h1>
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Panel de Proveedor</h1>
        </div>
        <Link href="/provider/apply">
          <GlassButton variant="solid" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva solicitud
          </GlassButton>
        </Link>
      </div>

      {/* No applications */}
      {!hasAnyApplication && (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center space-y-4">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Conviertete en proveedor</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Registra tu cancha o taller de encordado en nuestra plataforma y
              llega a mas jugadores.
            </p>
            <Link href="/provider/apply">
              <GlassButton variant="solid">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar ser proveedor
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Approved sections */}
      {(approvedCourt || approvedWorkshop) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Gestionar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {approvedCourt && (
              <Link href="/provider/courts">
                <GlassCard intensity="light" padding="lg" className="hover:bg-glass-medium transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">Mis Canchas</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {approvedCourt.businessName}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </GlassCard>
              </Link>
            )}

            {approvedWorkshop && (
              <Link href="/provider/workshops">
                <GlassCard intensity="light" padding="lg" className="hover:bg-glass-medium transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">Mis Talleres</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {approvedWorkshop.businessName}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </GlassCard>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* All applications */}
      {hasAnyApplication && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Mis solicitudes</h2>
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status]
            const Icon = config.icon
            return (
              <GlassCard key={app.id} intensity="light" padding="lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{app.businessName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.type === 'COURT' ? 'Cancha' : 'Taller'} - {app.businessPhone}
                        </p>
                      </div>
                    </div>
                    <GlassBadge variant={config.variant}>{config.label}</GlassBadge>
                  </div>

                  {app.description && (
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  )}

                  {app.status === 'REJECTED' && app.reviewNotes && (
                    <div className="rounded-lg bg-destructive/10 px-3 py-2">
                      <p className="text-sm text-destructive">
                        Motivo de rechazo: {app.reviewNotes}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Enviada el {new Date(app.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
