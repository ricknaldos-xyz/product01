'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { ArrowLeft, Loader2, Save, Package, AlertTriangle, CheckCircle } from 'lucide-react'

interface StockProduct {
  id: string
  name: string
  slug: string
  sku: string | null
  stock: number
  lowStockThreshold: number
  thumbnailUrl: string | null
  category: string
}

interface StockData {
  outOfStock: StockProduct[]
  lowStock: StockProduct[]
  healthy: StockProduct[]
  totals: { outOfStock: number; lowStock: number; healthy: number; total: number }
}

export default function AdminStockPage() {
  const router = useRouter()
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingStock, setEditingStock] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/shop/stock')
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      logger.error('Error al cargar inventario:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const handleStockChange = (productId: string, value: string) => {
    setEditingStock({ ...editingStock, [productId]: value })
  }

  const handleSaveStock = async (productId: string) => {
    const newStock = parseInt(editingStock[productId])
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock invalido')
      return
    }

    setSavingId(productId)
    try {
      const res = await fetch(`/api/admin/shop/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      })

      if (res.ok) {
        toast.success('Stock actualizado')
        setEditingStock((prev) => {
          const next = { ...prev }
          delete next[productId]
          return next
        })
        fetchStock()
      } else {
        toast.error('Error al actualizar stock')
      }
    } catch {
      toast.error('Error al actualizar stock')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const renderProductRow = (product: StockProduct) => (
    <div
      key={product.id}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-glass/20"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        {product.sku && (
          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
        )}
      </div>
      <div className="text-right text-sm">
        <p className="text-muted-foreground">Umbral: {product.lowStockThreshold}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={editingStock[product.id] ?? product.stock.toString()}
          onChange={(e) => handleStockChange(product.id, e.target.value)}
          className="glass-input w-20 text-center"
        />
        {editingStock[product.id] !== undefined && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => handleSaveStock(product.id)}
            disabled={savingId === product.id}
          >
            {savingId === product.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </GlassButton>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/tienda')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground text-sm">
            {data?.totals.total || 0} productos activos
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard intensity="light" className="border-destructive/30">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            <span className="font-semibold">Sin stock</span>
            <GlassBadge variant="destructive">{data?.totals.outOfStock || 0}</GlassBadge>
          </div>
        </GlassCard>
        <GlassCard intensity="light" className="border-yellow-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">Stock bajo</span>
            <GlassBadge variant="warning">{data?.totals.lowStock || 0}</GlassBadge>
          </div>
        </GlassCard>
        <GlassCard intensity="light" className="border-green-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Saludable</span>
            <GlassBadge variant="success">{data?.totals.healthy || 0}</GlassBadge>
          </div>
        </GlassCard>
      </div>

      {/* Out of Stock */}
      {data && data.outOfStock.length > 0 && (
        <GlassCard intensity="medium" className="border-destructive/30">
          <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sin stock ({data.outOfStock.length})
          </h3>
          <div className="space-y-1">
            {data.outOfStock.map(renderProductRow)}
          </div>
        </GlassCard>
      )}

      {/* Low Stock */}
      {data && data.lowStock.length > 0 && (
        <GlassCard intensity="medium" className="border-yellow-500/30">
          <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Stock bajo ({data.lowStock.length})
          </h3>
          <div className="space-y-1">
            {data.lowStock.map(renderProductRow)}
          </div>
        </GlassCard>
      )}

      {/* Healthy */}
      {data && data.healthy.length > 0 && (
        <GlassCard intensity="medium" className="border-green-500/30">
          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Saludable ({data.healthy.length})
          </h3>
          <div className="space-y-1">
            {data.healthy.map(renderProductRow)}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
