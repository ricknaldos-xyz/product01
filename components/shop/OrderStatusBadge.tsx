'use client'

import { GlassBadge } from '@/components/ui/glass-badge'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', variant: 'warning' },
  PAID: { label: 'Pagado', variant: 'primary' },
  PROCESSING: { label: 'En proceso', variant: 'primary' },
  SHIPPED: { label: 'Enviado', variant: 'primary' },
  DELIVERED: { label: 'Entregado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  REFUNDED: { label: 'Reembolsado', variant: 'outline' },
}

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const }

  return (
    <GlassBadge variant={config.variant}>
      {config.label}
    </GlassBadge>
  )
}
