'use client'

import { ProductCard } from './ProductCard'
import { GlassCard } from '@/components/ui/glass-card'
import { ShoppingBag } from 'lucide-react'

interface Product {
  id: string
  slug: string
  name: string
  brand: string
  priceCents: number
  comparePriceCents?: number | null
  thumbnailUrl?: string | null
  isFeatured: boolean
}

interface ProductGridProps {
  products: Product[]
  loading: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} intensity="light" padding="none">
            <div className="h-48 bg-secondary/50 rounded-t-2xl animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-secondary/50 rounded w-16 animate-pulse" />
              <div className="h-4 bg-secondary/50 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-secondary/50 rounded w-20 animate-pulse" />
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <GlassCard intensity="light" padding="xl">
        <div className="text-center text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otros filtros de busqueda</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
