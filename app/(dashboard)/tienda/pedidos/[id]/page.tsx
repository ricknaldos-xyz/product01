'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { OrderStatusBadge } from '@/components/shop/OrderStatusBadge'
import { OrderTimeline } from '@/components/shop/OrderTimeline'
import { CartSummary } from '@/components/shop/CartSummary'
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  FileText,
} from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  productSlug: string
  quantity: number
  priceCents: number
  product: {
    name: string
    slug: string
    thumbnailUrl: string | null
    priceCents: number
  }
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotalCents: number
  shippingCents: number
  discountCents: number
  totalCents: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingDistrict: string
  shippingCity: string
  shippingNotes: string | null
  items: OrderItem[]
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/shop/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      }
    } catch {
      console.error('Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Pedido no encontrado
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/tienda/pedidos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis pedidos
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedido {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-PE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <GlassCard intensity="light" padding="lg">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.product.thumbnailUrl ? (
                      <img
                        src={item.product.thumbnailUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/tienda/${item.productSlug}`}
                      className="font-medium text-sm hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.priceCents)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-glass-border-light mt-4 pt-4">
              <CartSummary
                subtotalCents={order.subtotalCents}
                shippingCents={order.shippingCents}
                discountCents={order.discountCents}
                totalCents={order.totalCents}
              />
            </div>
          </GlassCard>

          {/* Shipping info */}
          <GlassCard intensity="light" padding="lg">
            <h2 className="text-lg font-semibold mb-4">Datos de envio</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{order.shippingName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{order.shippingPhone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p>{order.shippingAddress}</p>
                  <p className="text-muted-foreground">
                    {order.shippingDistrict}, {order.shippingCity}
                  </p>
                </div>
              </div>
              {order.shippingNotes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {order.shippingNotes}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column - Timeline */}
        <div>
          <GlassCard intensity="light" padding="lg">
            <h2 className="text-lg font-semibold mb-4">Estado del pedido</h2>
            <OrderTimeline order={order} />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
