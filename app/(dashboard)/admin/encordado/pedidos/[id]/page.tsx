'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import AdminStringingStatusUpdate from '@/components/admin/AdminStringingStatusUpdate'
import { formatPrice } from '@/lib/shop'
import { ArrowLeft, Loader2, User, MapPin, Wrench, Save } from 'lucide-react'
import { StringingOrderStatus } from '@prisma/client'

interface StringingOrderDetail {
  id: string
  orderNumber: string
  status: StringingOrderStatus
  serviceType: string
  deliveryMode: string
  racketBrand: string
  racketModel: string
  racketNotes: string | null
  stringName: string
  tensionMain: number
  tensionCross: number | null
  servicePriceCents: number
  stringPriceCents: number
  pickupFeeCents: number
  totalCents: number
  pickupAddress: string | null
  pickupDistrict: string | null
  deliveryAddress: string | null
  deliveryDistrict: string | null
  contactPhone: string
  preferredPickupDate: string | null
  scheduledPickupDate: string | null
  estimatedCompletionDate: string | null
  internalNotes: string | null
  paidAt: string | null
  confirmedAt: string | null
  receivedAt: string | null
  completedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
  workshop: { id: string; name: string; address: string; district: string } | null
}

const SERVICE_LABELS: Record<string, string> = {
  STANDARD: 'Estandar',
  EXPRESS: 'Express',
}

const DELIVERY_LABELS: Record<string, string> = {
  HOME_PICKUP_DELIVERY: 'Recojo y entrega a domicilio',
  WORKSHOP_DROP_PICKUP: 'Dejar y recoger en taller',
}

export default function AdminEncordadoPedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<StringingOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/stringing/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setNotes(data.internalNotes || '')
      } else {
        toast.error('Orden no encontrada')
        router.push('/admin/encordado')
      }
    } catch {
      toast.error('Error al cargar orden')
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
      const res = await fetch(`/api/admin/stringing/orders/${id}`, {
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

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/stringing/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: notes }),
      })

      if (res.ok) {
        toast.success('Notas guardadas')
      } else {
        toast.error('Error al guardar notas')
      }
    } catch {
      toast.error('Error al guardar notas')
    } finally {
      setSavingNotes(false)
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
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/encordado')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Orden {order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            Creado el {new Date(order.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Racket & String Info */}
          <GlassCard intensity="medium">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Informacion del encordado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Raqueta</p>
                <p className="font-medium">{order.racketBrand} {order.racketModel}</p>
                {order.racketNotes && (
                  <p className="text-sm text-muted-foreground mt-1">{order.racketNotes}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cuerda</p>
                <p className="font-medium">{order.stringName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tension</p>
                <p className="font-medium">
                  {order.tensionMain} lbs
                  {order.tensionCross && ` / ${order.tensionCross} lbs`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de servicio</p>
                <GlassBadge variant={order.serviceType === 'EXPRESS' ? 'warning' : 'default'}>
                  {SERVICE_LABELS[order.serviceType] || order.serviceType}
                </GlassBadge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modo de entrega</p>
                <p className="font-medium">{DELIVERY_LABELS[order.deliveryMode] || order.deliveryMode}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-glass mt-4 pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Servicio</span>
                <span>{formatPrice(order.servicePriceCents)}</span>
              </div>
              {order.stringPriceCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Cuerda</span>
                  <span>{formatPrice(order.stringPriceCents)}</span>
                </div>
              )}
              {order.pickupFeeCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Recojo/entrega</span>
                  <span>{formatPrice(order.pickupFeeCents)}</span>
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
            <h3 className="text-lg font-semibold mb-4">Estado de la orden</h3>
            <AdminStringingStatusUpdate
              currentStatus={order.status}
              deliveryMode={order.deliveryMode}
              onUpdate={handleStatusUpdate}
              loading={updating}
            />

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-glass space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Historial</p>
              <div className="space-y-1 text-sm">
                <p>Creado: {new Date(order.createdAt).toLocaleString('es-PE')}</p>
                {order.paidAt && <p>Pagado: {new Date(order.paidAt).toLocaleString('es-PE')}</p>}
                {order.confirmedAt && <p>Confirmado: {new Date(order.confirmedAt).toLocaleString('es-PE')}</p>}
                {order.receivedAt && <p>Recibido en taller: {new Date(order.receivedAt).toLocaleString('es-PE')}</p>}
                {order.completedAt && <p>Encordado completado: {new Date(order.completedAt).toLocaleString('es-PE')}</p>}
                {order.deliveredAt && <p>Entregado: {new Date(order.deliveredAt).toLocaleString('es-PE')}</p>}
                {order.cancelledAt && <p className="text-destructive">Cancelado: {new Date(order.cancelledAt).toLocaleString('es-PE')}</p>}
              </div>
            </div>
          </GlassCard>

          {/* Internal Notes */}
          <GlassCard intensity="medium">
            <h3 className="text-lg font-semibold mb-3">Notas internas</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas internas sobre esta orden..."
              className="glass-input w-full"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Guardar notas
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <GlassCard intensity="light">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cliente</h3>
            </div>
            <p className="font-medium">{order.user.name || 'Sin nombre'}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
            <p className="text-sm mt-1">{order.contactPhone}</p>
          </GlassCard>

          {/* Delivery Info */}
          {order.deliveryMode === 'HOME_PICKUP_DELIVERY' && (
            <GlassCard intensity="light">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Direcciones</h3>
              </div>
              {order.pickupAddress && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Recojo</p>
                  <p className="text-sm">{order.pickupAddress}</p>
                  {order.pickupDistrict && (
                    <p className="text-sm">{order.pickupDistrict}</p>
                  )}
                </div>
              )}
              {order.deliveryAddress && (
                <div>
                  <p className="text-sm text-muted-foreground">Entrega</p>
                  <p className="text-sm">{order.deliveryAddress}</p>
                  {order.deliveryDistrict && (
                    <p className="text-sm">{order.deliveryDistrict}</p>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {/* Workshop */}
          {order.workshop && (
            <GlassCard intensity="light">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Taller</h3>
              </div>
              <p className="font-medium">{order.workshop.name}</p>
              <p className="text-sm">{order.workshop.address}</p>
              <p className="text-sm text-muted-foreground">{order.workshop.district}</p>
            </GlassCard>
          )}

          {/* Scheduling */}
          <GlassCard intensity="light">
            <h3 className="font-semibold mb-3">Programacion</h3>
            <div className="space-y-2 text-sm">
              {order.preferredPickupDate && (
                <div>
                  <p className="text-muted-foreground">Recojo preferido</p>
                  <p>{new Date(order.preferredPickupDate).toLocaleDateString('es-PE')}</p>
                </div>
              )}
              {order.scheduledPickupDate && (
                <div>
                  <p className="text-muted-foreground">Recojo programado</p>
                  <p>{new Date(order.scheduledPickupDate).toLocaleDateString('es-PE')}</p>
                </div>
              )}
              {order.estimatedCompletionDate && (
                <div>
                  <p className="text-muted-foreground">Finalizacion estimada</p>
                  <p>{new Date(order.estimatedCompletionDate).toLocaleDateString('es-PE')}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
