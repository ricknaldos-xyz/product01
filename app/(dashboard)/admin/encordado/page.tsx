'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import AdminStringingTable from '@/components/admin/AdminStringingTable'
import { Loader2, Wrench, CheckCircle, Clock, Search, Building2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING_PAYMENT', label: 'Pendiente de pago' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PICKUP_SCHEDULED', label: 'Recojo programado' },
  { value: 'RECEIVED_AT_WORKSHOP', label: 'Recibido en taller' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'STRINGING_COMPLETED', label: 'Encordado completado' },
  { value: 'READY_FOR_PICKUP', label: 'Listo para recoger' },
  { value: 'OUT_FOR_DELIVERY', label: 'En camino' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'STRINGING_CANCELLED', label: 'Cancelado' },
]

export default function AdminEncordadoPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    active: 0,
    completedToday: 0,
    pendingPickup: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      params.set('limit', '50')

      const res = await fetch(`/api/admin/stringing/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        const allOrders = data.orders || []
        setOrders(allOrders)

        const activeStatuses = [
          'CONFIRMED', 'PICKUP_SCHEDULED', 'RECEIVED_AT_WORKSHOP',
          'IN_PROGRESS', 'STRINGING_COMPLETED',
        ]
        const today = new Date().toDateString()

        setStats({
          active: allOrders.filter((o: { status: string }) => activeStatuses.includes(o.status)).length,
          completedToday: allOrders.filter(
            (o: { status: string; completedAt?: string }) =>
              o.status === 'DELIVERED' && o.completedAt && new Date(o.completedAt).toDateString() === today
          ).length,
          pendingPickup: allOrders.filter(
            (o: { status: string }) => o.status === 'READY_FOR_PICKUP' || o.status === 'OUT_FOR_DELIVERY'
          ).length,
        })
      }
    } catch (error) {
      console.error('Error al cargar ordenes:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Encordado</h1>
          <p className="text-muted-foreground text-sm">Gestion del servicio de encordado</p>
        </div>
        <GlassButton variant="ghost" onClick={() => router.push('/admin/encordado/talleres')}>
          <Building2 className="h-4 w-4 mr-2" />
          Talleres
        </GlassButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Ordenes activas</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.completedToday}</p>
              <p className="text-sm text-muted-foreground">Completados hoy</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.pendingPickup}</p>
              <p className="text-sm text-muted-foreground">Pendientes de entrega</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard intensity="light">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por numero de orden..."
              className="glass-input flex-1"
            />
            <GlassButton type="submit" variant="primary" size="sm">
              <Search className="h-4 w-4" />
            </GlassButton>
          </form>
        </div>
      </GlassCard>

      {/* Orders Table */}
      <GlassCard intensity="light" padding="none">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AdminStringingTable
            orders={orders as Array<{ id: string; orderNumber: string; status: string; serviceType: string; racketBrand: string; racketModel: string; createdAt: string; user: { name: string | null; email: string }; workshop: { name: string } | null }>}
            onViewDetail={(id) => router.push(`/admin/encordado/pedidos/${id}`)}
          />
        )}
      </GlassCard>
    </div>
  )
}
