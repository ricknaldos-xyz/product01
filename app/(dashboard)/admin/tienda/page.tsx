'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { logger } from '@/lib/logger'
import { formatPrice } from '@/lib/shop'
import AdminOrderTable from '@/components/admin/AdminOrderTable'
import AdminStockAlert from '@/components/admin/AdminStockAlert'
import { useRouter } from 'next/navigation'
import { Package, ShoppingCart, AlertTriangle, DollarSign, Plus, ClipboardList, BarChart3, Loader2 } from 'lucide-react'

interface StatsData {
  totalProducts: number
  activeProducts: number
  pendingOrders: number
  totalRevenueCents: number
}

export default function AdminTiendaPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<Record<string, unknown>>>([])
  const [lowStockProducts, setLowStockProducts] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, ordersRes, stockRes] = await Promise.all([
        fetch('/api/admin/shop/products?limit=1'),
        fetch('/api/admin/shop/orders?limit=10'),
        fetch('/api/admin/shop/stock'),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        const allProductsRes = await fetch('/api/admin/shop/products?limit=1000')
        const allData = allProductsRes.ok ? await allProductsRes.json() : { products: [], pagination: { total: 0 } }
        const activeCount = allData.products.filter((p: { isActive: boolean }) => p.isActive).length
        const paidOrders = await fetch('/api/admin/shop/orders?status=PAID&limit=1')
        const paidData = paidOrders.ok ? await paidOrders.json() : { pagination: { total: 0 } }

        setStats({
          totalProducts: allData.pagination.total,
          activeProducts: activeCount,
          pendingOrders: paidData.pagination.total,
          totalRevenueCents: 0,
        })
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.orders || [])

        const revenue = (ordersData.orders || [])
          .filter((o: { status: string }) => ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status))
          .reduce((sum: number, o: { totalCents: number }) => sum + o.totalCents, 0)

        setStats((prev) => prev ? { ...prev, totalRevenueCents: revenue } : prev)
      }

      if (stockRes.ok) {
        const stockData = await stockRes.json()
        setLowStockProducts([...stockData.outOfStock, ...stockData.lowStock])
      }
    } catch (error) {
      logger.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tienda</h1>
          <p className="text-muted-foreground text-sm">Gestion de productos y pedidos</p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="primary" onClick={() => router.push('/admin/tienda/productos/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </GlassButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Total productos</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.activeProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Productos activos</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Pedidos pendientes</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard intensity="light">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenueCents || 0)}</p>
              <p className="text-sm text-muted-foreground">Ingresos recientes</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <GlassButton variant="ghost" onClick={() => router.push('/admin/tienda/pedidos')}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Ver todos los pedidos
        </GlassButton>
        <GlassButton variant="ghost" onClick={() => router.push('/admin/tienda/stock')}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Inventario
        </GlassButton>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <AdminStockAlert products={lowStockProducts as Array<{ id: string; name: string; slug: string; sku: string | null; stock: number; lowStockThreshold: number }>} />
      )}

      {/* Recent Orders */}
      <GlassCard intensity="light" padding="none">
        <div className="p-4 border-b border-glass">
          <h2 className="text-lg font-semibold">Pedidos recientes</h2>
        </div>
        <AdminOrderTable
          orders={recentOrders as Array<{ id: string; orderNumber: string; status: string; totalCents: number; createdAt: string; user: { name: string | null; email: string }; _count: { items: number } }>}
          onViewDetail={(id) => router.push(`/admin/tienda/pedidos/${id}`)}
        />
      </GlassCard>
    </div>
  )
}
