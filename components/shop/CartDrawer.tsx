'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { CartItemRow } from './CartItemRow'
import { CartSummary } from './CartSummary'
import { X, Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    priceCents: number
    thumbnailUrl: string | null
    stock: number
    isActive: boolean
  }
  quantity: number
}

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [subtotalCents, setSubtotalCents] = useState(0)
  const [shippingCents, setShippingCents] = useState(0)
  const [totalCents, setTotalCents] = useState(0)

  useEffect(() => {
    if (open) {
      fetchCart()
    }
  }, [open])

  async function fetchCart() {
    setLoading(true)
    try {
      const res = await fetch('/api/shop/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setSubtotalCents(data.subtotalCents)
        setShippingCents(data.shippingCents)
        setTotalCents(data.totalCents)
      }
    } catch {
      logger.error('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  async function handleQuantityChange(itemId: string, quantity: number) {
    try {
      const res = await fetch(`/api/shop/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        fetchCart()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al actualizar cantidad')
      }
    } catch {
      toast.error('Error al actualizar cantidad')
    }
  }

  async function handleRemove(itemId: string) {
    try {
      const res = await fetch(`/api/shop/cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchCart()
      } else {
        toast.error('Error al eliminar item')
      }
    } catch {
      toast.error('Error al eliminar item')
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md glass-light border-l border-glass z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border-light">
          <h2 className="text-lg font-semibold">Carrito</h2>
          <GlassButton variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </GlassButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Tu carrito esta vacio</p>
              <p className="text-sm mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="divide-y divide-glass-border-light">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-glass-border-light space-y-4">
            <CartSummary
              subtotalCents={subtotalCents}
              shippingCents={shippingCents}
              totalCents={totalCents}
            />
            <div className="flex gap-2">
              <Link href="/tienda/carrito" className="flex-1" onClick={onClose}>
                <GlassButton variant="outline" className="w-full">
                  Ver carrito
                </GlassButton>
              </Link>
              <Link href="/tienda/checkout" className="flex-1" onClick={onClose}>
                <GlassButton variant="solid" className="w-full">
                  Pagar
                </GlassButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
