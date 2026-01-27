'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { PriceDisplay } from './PriceDisplay'
import { ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    brand: string
    priceCents: number
    comparePriceCents?: number | null
    thumbnailUrl?: string | null
    isFeatured: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/tienda/${product.slug}`}>
      <GlassCard intensity="light" padding="none" hover="lift">
        {/* Image */}
        <div className="relative h-48 bg-secondary/50 rounded-t-2xl overflow-hidden flex items-center justify-center">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          )}
          {product.isFeatured && (
            <div className="absolute top-3 left-3">
              <GlassBadge variant="primary">Destacado</GlassBadge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.brand}
          </p>
          <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
          <PriceDisplay
            priceCents={product.priceCents}
            comparePriceCents={product.comparePriceCents}
          />
        </div>
      </GlassCard>
    </Link>
  )
}
