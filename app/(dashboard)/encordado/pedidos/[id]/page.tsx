'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassBadge } from '@/components/ui/glass-badge'
import { StringingStatusTracker } from '@/components/stringing/StringingStatusTracker'
import { formatPrice } from '@/lib/shop'
import { Loader2, Package, ArrowLeft } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import Link from 'next/link'

interface Workshop {
  id: string
  name: string
  address: string
  district: string
  phone: string | null
}

interface StringingOrderDetail {
  id: string
  orderNumber: string
  status: string
  serviceType: string
  deliveryMode: string
  racketBrand: string
  racketModel: string
  racketNotes: string | null
  stringName: string
  tensionMain: number
  tensionCross: number | null
  workshopId: string | null
  workshop: Workshop | null
  pickupAddress: string | null
  pickupDistrict: string | null
  deliveryAddress: string | null
  deliveryDistrict: string | null
  contactPhone: string
  preferredPickupDate: string | null
  servicePriceCents: number
  pickupFeeCents: number
  stringPriceCents: number
  totalCents: number
  confirmedAt: string | null
  receivedAt: string | null
  completedAt: string | null
  deliveredAt: string | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PICKUP_SCHEDULED: 'Recojo programado',
  RECEIVED_AT_WORKSHOP: 'Recibido en taller',
  IN_PROGRESS: 'En proceso',
  STRINGING_COMPLETED: 'Encordado completado',
  OUT_FOR_DELIVERY: 'En camino',
  READY_FOR_PICKUP: 'Listo para recoger',
  DELIVERED: 'Entregado',
  STRINGING_CANCELLED: 'Cancelado',
}

const STATUS_VARIANT: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'primary',
  PICKUP_SCHEDULED: 'primary',
  RECEIVED_AT_WORKSHOP: 'primary',
  IN_PROGRESS: 'primary',
  STRINGING_COMPLETED: 'success',
  OUT_FOR_DELIVERY: 'primary',
  READY_FOR_PICKUP: 'success',
  DELIVERED: 'success',
  STRINGING_CANCELLED: 'destructive',
}

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<StringingOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/stringing/orders/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
        }
      } catch {
        logger.error('Error fetching order detail')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto">
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Pedido no encontrado</p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/encordado/pedidos">
        <GlassButton variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a pedidos
        </GlassButton>
      </Link>

      {/* Order Header */}
      <GlassCard intensity="medium" padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pedido</p>
            <h1 className="text-xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <GlassBadge variant={STATUS_VARIANT[order.status] || 'default'} size="lg">
            {STATUS_LABELS[order.status] || order.status}
          </GlassBadge>
        </div>
      </GlassCard>

      {/* Status Tracker */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Estado del Pedido</h2>
        <StringingStatusTracker
          status={order.status}
          deliveryMode={order.deliveryMode}
          timestamps={{
            confirmedAt: order.confirmedAt,
            receivedAt: order.receivedAt,
            completedAt: order.completedAt,
            deliveredAt: order.deliveredAt,
          }}
        />
      </GlassCard>

      {/* Racket Info */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-3">Raqueta</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marca</span>
            <span className="font-medium">{order.racketBrand}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modelo</span>
            <span className="font-medium">{order.racketModel}</span>
          </div>
          {order.racketNotes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notas</span>
              <span className="font-medium">{order.racketNotes}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* String Info */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-3">Cuerda</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cuerda</span>
            <span className="font-medium">{order.stringName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tension principales</span>
            <span className="font-medium">{order.tensionMain} lbs</span>
          </div>
          {order.tensionCross && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tension cruzadas</span>
              <span className="font-medium">{order.tensionCross} lbs</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Service & Delivery */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-3">Servicio y Entrega</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de servicio</span>
            <GlassBadge variant={order.serviceType === 'EXPRESS' ? 'warning' : 'default'} size="sm">
              {order.serviceType === 'STANDARD' ? 'Estandar' : 'Express'}
            </GlassBadge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modo de entrega</span>
            <span className="font-medium">
              {order.deliveryMode === 'HOME_PICKUP_DELIVERY' ? 'A Domicilio' : 'En Taller'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telefono</span>
            <span className="font-medium">{order.contactPhone}</span>
          </div>
        </div>
      </GlassCard>

      {/* Workshop */}
      {order.workshop && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="text-lg font-semibold mb-3">Taller</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="font-medium">{order.workshop.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Direccion</span>
              <span className="font-medium">{order.workshop.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distrito</span>
              <span className="font-medium">{order.workshop.district}</span>
            </div>
            {order.workshop.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefono</span>
                <span className="font-medium">{order.workshop.phone}</span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Addresses */}
      {order.deliveryMode === 'HOME_PICKUP_DELIVERY' && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="text-lg font-semibold mb-3">Direcciones</h2>
          <div className="space-y-2 text-sm">
            {order.pickupAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recojo</span>
                <span className="font-medium">{order.pickupAddress} - {order.pickupDistrict}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entrega</span>
                <span className="font-medium">{order.deliveryAddress} - {order.deliveryDistrict}</span>
              </div>
            )}
            {order.preferredPickupDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha preferida</span>
                <span className="font-medium">
                  {new Date(order.preferredPickupDate).toLocaleDateString('es-PE')}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Price Breakdown */}
      <GlassCard intensity="medium" padding="lg">
        <h2 className="text-lg font-semibold mb-3">Detalle de Precio</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Servicio de encordado</span>
            <span>{formatPrice(order.servicePriceCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{order.pickupFeeCents === 0 ? 'Gratis' : formatPrice(order.pickupFeeCents)}</span>
          </div>
          {order.stringPriceCents > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuerda</span>
              <span>{formatPrice(order.stringPriceCents)}</span>
            </div>
          )}
          <hr className="border-glass" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
