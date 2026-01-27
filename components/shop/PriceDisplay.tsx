'use client'

import { GlassBadge } from '@/components/ui/glass-badge'

interface PriceDisplayProps {
  priceCents: number
  comparePriceCents?: number | null
  className?: string
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export function PriceDisplay({ priceCents, comparePriceCents, className }: PriceDisplayProps) {
  const discount = comparePriceCents
    ? Math.round(((comparePriceCents - priceCents) / comparePriceCents) * 100)
    : 0

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <span className="font-bold text-foreground">{formatPrice(priceCents)}</span>
      {comparePriceCents && comparePriceCents > priceCents && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(comparePriceCents)}
          </span>
          <GlassBadge variant="destructive" size="sm">
            -{discount}%
          </GlassBadge>
        </>
      )}
    </div>
  )
}
