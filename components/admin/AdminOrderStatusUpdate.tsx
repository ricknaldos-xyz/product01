'use client'

import { useState } from 'react'
import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassButton } from '@/components/ui/glass-button'
import { Loader2 } from 'lucide-react'

interface AdminOrderStatusUpdateProps {
  currentStatus: string
  onUpdate: (newStatus: string) => Promise<void>
  loading: boolean
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'primary',
  PROCESSING: 'default',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
}

const NEXT_STATUSES: Record<string, string[]> = {
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
}

export default function AdminOrderStatusUpdate({
  currentStatus,
  onUpdate,
  loading,
}: AdminOrderStatusUpdateProps) {
  const [confirming, setConfirming] = useState<string | null>(null)

  const nextStatuses = NEXT_STATUSES[currentStatus] || []

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
                variant={status === 'CANCELLED' ? 'destructive' : 'primary'}
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
          Este pedido se encuentra en su estado final
        </p>
      )}
    </div>
  )
}
