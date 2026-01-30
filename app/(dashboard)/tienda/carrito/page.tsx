'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { CartItemRow } from '@/components/shop/CartItemRow'
import { CartSummary } from '@/components/shop/CartSummary'
import { ShoppingCart, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

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

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [subtotalCents, setSubtotalCents] = useState(0)
  const [shippingCents, setShippingCents] = useState(0)
  const [totalCents, setTotalCents] = useState(0)

  useEffect(() => {
    fetchCart()
  }, [])

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
    if (quantity < 1) return
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
        toast.success('Producto eliminado del carrito')
      } else {
        toast.error('Error al eliminar producto')
      }
    } catch {
      toast.error('Error al eliminar producto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Carrito de compras</h1>
      </div>

      {items.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Tu carrito esta vacio</p>
            <p className="text-sm mt-1">Explora nuestra tienda y agrega productos</p>
            <Link href="/tienda" className="inline-block mt-4">
              <GlassButton variant="solid">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ir a la tienda
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <GlassCard intensity="light" padding="md">
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
            </GlassCard>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Seguir comprando
            </Link>
          </div>

          {/* Summary */}
          <div>
            <GlassCard intensity="light" padding="lg">
              <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
              <CartSummary
                subtotalCents={subtotalCents}
                shippingCents={shippingCents}
                totalCents={totalCents}
              />
              <Link href="/tienda/checkout" className="block mt-4">
                <GlassButton variant="solid" size="lg" className="w-full">
                  Proceder al pago
                </GlassButton>
              </Link>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  )
}
