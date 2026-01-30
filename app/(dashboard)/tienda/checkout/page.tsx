'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { CheckoutForm } from '@/components/shop/CheckoutForm'
import { CartSummary } from '@/components/shop/CartSummary'
import { CreditCard, ArrowLeft, Loader2, ShoppingBag } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import CulqiCheckout from '@/components/CulqiCheckout'
import { toast } from 'sonner'

interface CartItem {
  id: string
  product: {
    name: string
    priceCents: number
    thumbnailUrl: string | null
  }
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shippingData, setShippingData] = useState<{
    shippingName: string
    shippingPhone: string
    shippingAddress: string
    shippingDistrict: string
    shippingCity: string
    shippingNotes?: string
  } | null>(null)
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

        if (data.items.length === 0) {
          router.push('/tienda/carrito')
        }
      }
    } catch {
      logger.error('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  function handleShippingSubmit(data: {
    shippingName: string
    shippingPhone: string
    shippingAddress: string
    shippingDistrict: string
    shippingCity: string
    shippingNotes?: string
  }) {
    setShippingData(data)
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
        <CreditCard className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Finalizar compra</h1>
      </div>

      <Link
        href="/tienda/carrito"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al carrito
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <GlassCard intensity="light" padding="lg">
            <h2 className="text-lg font-semibold mb-4">Datos de envio</h2>
            <CheckoutForm onSubmit={handleShippingSubmit} loading={submitting} />
            {shippingData && (
              <div className="mt-4">
                <CulqiCheckout
                  amount={totalCents}
                  title="Compra SportTech"
                  description={`Pedido - ${items.length} producto(s)`}
                  onToken={async (tokenId) => {
                    setSubmitting(true)
                    try {
                      const res = await fetch('/api/shop/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...shippingData, tokenId }),
                      })
                      if (res.ok) {
                        const result = await res.json()
                        router.push(`/tienda/checkout/success?orderId=${result.orderId}`)
                      } else {
                        const result = await res.json()
                        toast.error(result.error || 'Error al procesar el pago')
                      }
                    } catch {
                      toast.error('Error al procesar el pago')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                  onError={(msg) => toast.error(msg)}
                  loading={submitting}
                  buttonText="Confirmar y pagar"
                  buttonVariant="solid"
                />
              </div>
            )}
          </GlassCard>
        </div>

        {/* Order summary */}
        <div>
          <GlassCard intensity="light" padding="lg">
            <h2 className="text-lg font-semibold mb-4">Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.product.thumbnailUrl ? (
                      <Image
                        src={item.product.thumbnailUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      x{item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    S/ {((item.product.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-glass-border-light pt-4">
              <CartSummary
                subtotalCents={subtotalCents}
                shippingCents={shippingCents}
                totalCents={totalCents}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
