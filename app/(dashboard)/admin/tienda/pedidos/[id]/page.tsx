'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import AdminOrderStatusUpdate from '@/components/admin/AdminOrderStatusUpdate'
import { formatPrice } from '@/lib/shop'
import { ArrowLeft, Loader2, User, MapPin, CreditCard } from 'lucide-react'
import Image from 'next/image'

interface OrderItem {
  id: string
  quantity: number
  priceCents: number
  productName: string
  productSlug: string
  product: { id: string; slug: string; thumbnailUrl: string | null }
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotalCents: number
  shippingCents: number
  discountCents: number
  totalCents: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingDistrict: string
  shippingCity: string
  shippingNotes: string | null
  stripePaymentIntentId: string | null
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
  items: OrderItem[]
}

export default function AdminPedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/shop/orders/${id}`)
      if (res.ok) {
        setOrder(await res.json())
      } else {
        toast.error('Pedido no encontrado')
        router.push('/admin/tienda/pedidos')
      }
    } catch {
      toast.error('Error al cargar pedido')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/shop/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success('Estado actualizado correctamente')
        fetchOrder()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar estado')
      }
    } catch {
      toast.error('Error al actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/tienda/pedidos')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Pedido {order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            Creado el {new Date(order.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <GlassCard intensity="medium">
            <h3 className="text-lg font-semibold mb-4">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass/20">
                  {item.product.thumbnailUrl ? (
                    <Image
                      src={item.product.thumbnailUrl}
                      alt={item.productName}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                      N/A
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.priceCents)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-glass mt-4 pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envio</span>
                <span>{formatPrice(order.shippingCents)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatPrice(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-glass">
                <span>Total</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Status Update */}
          <GlassCard intensity="medium">
            <h3 className="text-lg font-semibold mb-4">Estado del pedido</h3>
            <AdminOrderStatusUpdate
              currentStatus={order.status}
              onUpdate={handleStatusUpdate}
              loading={updating}
            />

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-glass space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Historial</p>
              <div className="space-y-1 text-sm">
                <p>Creado: {new Date(order.createdAt).toLocaleString('es-PE')}</p>
                {order.paidAt && <p>Pagado: {new Date(order.paidAt).toLocaleString('es-PE')}</p>}
                {order.shippedAt && <p>Enviado: {new Date(order.shippedAt).toLocaleString('es-PE')}</p>}
                {order.deliveredAt && <p>Entregado: {new Date(order.deliveredAt).toLocaleString('es-PE')}</p>}
                {order.cancelledAt && <p className="text-destructive">Cancelado: {new Date(order.cancelledAt).toLocaleString('es-PE')}</p>}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <GlassCard intensity="light">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cliente</h3>
            </div>
            <p className="font-medium">{order.user.name || 'Sin nombre'}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
          </GlassCard>

          {/* Shipping Info */}
          <GlassCard intensity="light">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Direccion de envio</h3>
            </div>
            <p className="font-medium">{order.shippingName}</p>
            <p className="text-sm">{order.shippingPhone}</p>
            <p className="text-sm">{order.shippingAddress}</p>
            <p className="text-sm">{order.shippingDistrict}, {order.shippingCity}</p>
            {order.shippingNotes && (
              <p className="text-sm text-muted-foreground mt-2">
                Notas: {order.shippingNotes}
              </p>
            )}
          </GlassCard>

          {/* Payment Info */}
          <GlassCard intensity="light">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Pago</h3>
            </div>
            {order.stripePaymentIntentId ? (
              <p className="text-sm font-mono break-all">{order.stripePaymentIntentId}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin informacion de pago</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
