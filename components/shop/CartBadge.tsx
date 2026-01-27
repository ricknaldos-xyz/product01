'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface CartBadgeProps {
  count: number
}

export function CartBadge({ count }: CartBadgeProps) {
  return (
    <Link href="/tienda/carrito" className="relative inline-flex items-center justify-center">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
