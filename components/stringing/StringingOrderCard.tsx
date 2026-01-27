'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { formatPrice } from '@/lib/shop'
import { ChevronRight } from 'lucide-react'

interface StringingOrderCardProps {
  order: {
    id: string
    orderNumber: string
    status: string
    serviceType: string
    racketBrand: string
    racketModel: string
    stringName: string
    totalCents: number
    createdAt: string
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PICKUP_SCHEDULED: 'Recojo programado',
  RECEIVED: 'Recibido',
  IN_PROGRESS: 'En proceso',
  COMPLETED: 'Completado',
  IN_TRANSIT: 'En camino',
  READY_FOR_PICKUP: 'Listo para recoger',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_VARIANT: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'primary',
  PICKUP_SCHEDULED: 'primary',
  RECEIVED: 'primary',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  IN_TRANSIT: 'primary',
  READY_FOR_PICKUP: 'success',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
}

export function StringingOrderCard({ order }: StringingOrderCardProps) {
  return (
    <Link href={`/encordado/pedidos/${order.id}`}>
      <GlassCard intensity="light" padding="md" hover="lift">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
              <GlassBadge
                variant={STATUS_VARIANT[order.status] || 'default'}
                size="sm"
              >
                {STATUS_LABELS[order.status] || order.status}
              </GlassBadge>
              <GlassBadge
                variant={order.serviceType === 'EXPRESS' ? 'warning' : 'default'}
                size="sm"
              >
                {order.serviceType === 'STANDARD' ? 'Estandar' : 'Express'}
              </GlassBadge>
            </div>
            <p className="text-sm mt-1">
              {order.racketBrand} {order.racketModel}
            </p>
            <p className="text-sm text-muted-foreground">{order.stringName}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{formatPrice(order.totalCents)}</span>
              <span>
                {new Date(order.createdAt).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </GlassCard>
    </Link>
  )
}
