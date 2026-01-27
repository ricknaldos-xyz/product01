'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { OrderStatusBadge } from '@/components/shop/OrderStatusBadge'
import { CheckCircle2, Loader2, ShoppingBag, ClipboardList } from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotalCents: number
  shippingCents: number
  totalCents: number
  items: {
    id: string
    productName: string
    productSlug: string
    quantity: number
    priceCents: number
  }[]
  createdAt: string
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [orderId])

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/shop/orders/${orderId}`)
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success message */}
      <GlassCard intensity="primary" padding="xl">
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <h1 className="text-2xl font-bold">Pedido confirmado</h1>
          <p className="text-muted-foreground">
            Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
          </p>
          {order && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Numero de pedido:</span>
              <span className="font-mono font-bold">{order.orderNumber}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Order summary */}
      {order && (
        <GlassCard intensity="light" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Resumen del pedido</h2>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                </div>
                <span>{formatPrice(item.priceCents * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-glass-border-light pt-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Envio</span>
              <span>{formatPrice(order.shippingCents)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Link href="/tienda/pedidos">
          <GlassButton variant="outline">
            <ClipboardList className="h-4 w-4 mr-2" />
            Ver mis pedidos
          </GlassButton>
        </Link>
        <Link href="/tienda">
          <GlassButton variant="solid">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Seguir comprando
          </GlassButton>
        </Link>
      </div>
    </div>
  )
}
