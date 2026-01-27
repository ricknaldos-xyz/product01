'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface StockProduct {
  id: string
  name: string
  slug: string
  sku: string | null
  stock: number
  lowStockThreshold: number
}

interface AdminStockAlertProps {
  products: StockProduct[]
}

export default function AdminStockAlert({ products }: AdminStockAlertProps) {
  if (products.length === 0) return null

  return (
    <GlassCard intensity="medium" className="border-yellow-500/30">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Alertas de stock</h3>
        <span className="text-sm text-muted-foreground">({products.length} productos)</span>
      </div>
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-glass/20"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              {product.sku && (
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p
                  className={`font-bold ${
                    product.stock === 0 ? 'text-destructive' : 'text-yellow-600'
                  }`}
                >
                  {product.stock} unidades
                </p>
                <p className="text-xs text-muted-foreground">
                  Umbral: {product.lowStockThreshold}
                </p>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.location.assign(`/admin/tienda/productos/${product.id}`)
                }
              >
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
