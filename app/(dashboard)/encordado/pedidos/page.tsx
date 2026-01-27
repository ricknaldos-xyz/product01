'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { StringingOrderCard } from '@/components/stringing/StringingOrderCard'
import { Loader2, Package } from 'lucide-react'

interface StringingOrder {
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

export default function PedidosEncordadoPage() {
  const [orders, setOrders] = useState<StringingOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/stringing/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch {
        console.error('Error fetching stringing orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Mis Pedidos de Encordado</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tienes pedidos</p>
            <p className="text-sm mt-1">
              Aun no has solicitado ningun servicio de encordado.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <StringingOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
