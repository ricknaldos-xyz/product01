'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { StringingOrderCard } from '@/components/stringing/StringingOrderCard'
import { Loader2, Package } from 'lucide-react'
import { logger } from '@/lib/logger'

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
        logger.error('Error fetching stringing orders')
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
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No tienes pedidos aun</p>
            <p className="text-sm text-muted-foreground mb-4">
              Aun no has solicitado ningun servicio de encordado.
            </p>
            <Link href="/encordado">
              <GlassButton variant="solid" size="sm">
                Solicitar encordado
              </GlassButton>
            </Link>
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
