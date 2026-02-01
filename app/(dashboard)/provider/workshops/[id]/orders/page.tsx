'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { ArrowLeft, Loader2, User, Wrench, Calendar } from 'lucide-react'
import { StringingOrderStatus } from '@prisma/client'

interface OrderSummary {
  id: string
  orderNumber: string
  status: StringingOrderStatus
  serviceType: string
  deliveryMode: string
  racketBrand: string
  racketModel: string
  stringName: string
  tensionMain: number
  tensionCross: number | null
  contactPhone: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
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
  PENDING_PAYMENT: 'default',
  CONFIRMED: 'primary',
  PICKUP_SCHEDULED: 'primary',
  RECEIVED_AT_WORKSHOP: 'warning',
  IN_PROGRESS: 'warning',
  STRINGING_COMPLETED: 'success',
  READY_FOR_PICKUP: 'success',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  STRINGING_CANCELLED: 'destructive',
}

type TabKey = 'all' | 'confirmed' | 'in_progress' | 'completed' | 'delivered'

const TABS: { key: TabKey; label: string; statuses: string[] | null }[] = [
  { key: 'all', label: 'Todos', statuses: null },
  { key: 'confirmed', label: 'Confirmados', statuses: ['CONFIRMED', 'PICKUP_SCHEDULED', 'RECEIVED_AT_WORKSHOP'] },
  { key: 'in_progress', label: 'En progreso', statuses: ['IN_PROGRESS', 'STRINGING_COMPLETED'] },
  { key: 'completed', label: 'Completados', statuses: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
  { key: 'delivered', label: 'Entregados', statuses: ['DELIVERED'] },
]

export default function ProviderWorkshopOrdersPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')

      // For tabs with specific statuses, we fetch all and filter client-side
      // since the API supports a single status filter
      const tab = TABS.find((t) => t.key === activeTab)
      if (tab?.statuses && tab.statuses.length === 1) {
        params.set('status', tab.statuses[0])
      }

      const res = await fetch(`/api/provider/workshops/${id}/orders?${params}`, { signal })
      if (res.ok) {
        const data = await res.json()
        let fetchedOrders: OrderSummary[] = data.orders || []

        // Client-side filter for multi-status tabs
        if (tab?.statuses && tab.statuses.length > 1) {
          fetchedOrders = fetchedOrders.filter((o) => (tab.statuses ?? []).includes(o.status))
        }

        setOrders(fetchedOrders)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        toast.error('Error al cargar pedidos')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [id, page, activeTab])

  useEffect(() => {
    const controller = new AbortController()
    fetchOrders(controller.signal)
    return () => controller.abort()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push(`/provider/workshops/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Pedidos del taller</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los pedidos de encordado
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <GlassButton
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </GlassButton>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <GlassCard intensity="light">
          <p className="text-center text-muted-foreground py-8">
            No hay pedidos en esta categoria.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GlassCard
              key={order.id}
              intensity="light"
              className="cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => router.push(`/provider/workshops/${id}/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
                    <GlassBadge variant={STATUS_VARIANTS[order.status] || 'default'}>
                      {STATUS_LABELS[order.status] || order.status}
                    </GlassBadge>
                    {order.serviceType === 'EXPRESS' && (
                      <GlassBadge variant="warning">Express</GlassBadge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{order.user.name || order.user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{order.racketBrand} {order.racketModel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(order.createdAt).toLocaleDateString('es-PE')}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {order.stringName} &middot; {order.tensionMain} lbs
                    {order.tensionCross ? ` / ${order.tensionCross} lbs` : ''}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <GlassButton
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </GlassButton>
              <span className="flex items-center text-sm text-muted-foreground">
                Pagina {page} de {totalPages}
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </GlassButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
