'use client'

import { useState } from 'react'
import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassButton } from '@/components/ui/glass-button'
import { STRINGING_STATUS_FLOW } from '@/lib/stringing'
import { Loader2 } from 'lucide-react'
import { StringingOrderStatus } from '@prisma/client'

interface AdminStringingStatusUpdateProps {
  currentStatus: StringingOrderStatus
  deliveryMode: string
  onUpdate: (newStatus: string) => Promise<void>
  loading: boolean
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PICKUP_SCHEDULED: 'Recojo programado',
  RECEIVED_AT_WORKSHOP: 'Recibido en taller',
  IN_PROGRESS: 'En proceso',
  STRINGING_COMPLETED: 'Encordado completado',
  READY_FOR_PICKUP: 'Listo para recoger',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  STRINGING_CANCELLED: 'Cancelado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'primary',
  PICKUP_SCHEDULED: 'default',
  RECEIVED_AT_WORKSHOP: 'default',
  IN_PROGRESS: 'primary',
  STRINGING_COMPLETED: 'success',
  READY_FOR_PICKUP: 'success',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  STRINGING_CANCELLED: 'destructive',
}

export default function AdminStringingStatusUpdate({
  currentStatus,
  deliveryMode,
  onUpdate,
  loading,
}: AdminStringingStatusUpdateProps) {
  const [confirming, setConfirming] = useState<string | null>(null)

  const flow = STRINGING_STATUS_FLOW[currentStatus] || []
  const nextStatuses = Array.isArray(flow)
    ? flow
    : (flow as Record<string, StringingOrderStatus[]>)[deliveryMode] || []

  const handleClick = (status: string) => {
    if (confirming === status) {
      onUpdate(status)
      setConfirming(null)
    } else {
      setConfirming(status)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Estado actual:</span>
        <GlassBadge variant={STATUS_VARIANTS[currentStatus] || 'default'}>
          {STATUS_LABELS[currentStatus] || currentStatus}
        </GlassBadge>
      </div>

      {nextStatuses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Cambiar estado a:</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <GlassButton
                key={status}
                variant={status === 'STRINGING_CANCELLED' ? 'destructive' : 'primary'}
                size="sm"
                onClick={() => handleClick(status)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : confirming === status ? (
                  'Confirmar'
                ) : (
                  STATUS_LABELS[status] || status
                )}
              </GlassButton>
            ))}
          </div>
          {confirming && (
            <p className="text-xs text-yellow-600">
              Haz clic de nuevo para confirmar el cambio de estado
            </p>
          )}
        </div>
      )}

      {nextStatuses.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Esta orden se encuentra en su estado final
        </p>
      )}
    </div>
  )
}
