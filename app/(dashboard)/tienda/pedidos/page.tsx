'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { OrderStatusBadge } from '@/components/shop/OrderStatusBadge'
import { ClipboardList, Loader2, Package } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalCents: number
  createdAt: string
  items: {
    id: string
    quantity: number
    productName: string
    product: {
      name: string
      thumbnailUrl: string | null
    }
  }[]
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/shop/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch {
      console.error('Failed to fetch orders')
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Mis pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tienes pedidos aun</p>
            <p className="text-sm mt-1">Cuando realices una compra, tus pedidos apareceran aqui</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <Link key={order.id} href={`/tienda/pedidos/${order.id}`}>
                <GlassCard intensity="light" padding="md" hover="lift">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-sm">
                          {order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(order.totalCents)}</p>
                    </div>
                  </div>

                  {/* Product thumbnails */}
                  <div className="flex gap-2 mt-3">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="h-10 w-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 flex items-center justify-center"
                      >
                        {item.product.thumbnailUrl ? (
                          <img
                            src={item.product.thumbnailUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
