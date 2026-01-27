'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

interface CartItemRowProps {
  item: {
    id: string
    product: {
      name: string
      slug: string
      thumbnailUrl: string | null
      priceCents: number
    }
    quantity: number
  }
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const lineTotal = item.product.priceCents * item.quantity

  return (
    <div className="flex items-center gap-4 py-3">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.product.thumbnailUrl ? (
          <Image
            src={item.product.thumbnailUrl}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/tienda/${item.product.slug}`}
          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
        >
          {item.product.name}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatPrice(item.product.priceCents)} c/u
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <GlassButton
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </GlassButton>
        <span className="w-8 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>
        <GlassButton
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          disabled={item.quantity >= 10}
        >
          <Plus className="h-4 w-4" />
        </GlassButton>
      </div>

      {/* Line total */}
      <div className="text-right flex-shrink-0 w-20">
        <p className="font-semibold text-sm">{formatPrice(lineTotal)}</p>
      </div>

      {/* Remove */}
      <GlassButton
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </GlassButton>
    </div>
  )
}
