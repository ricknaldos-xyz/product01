'use client'

import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassButton } from '@/components/ui/glass-button'
import { Eye } from 'lucide-react'

interface StringingOrder {
  id: string
  orderNumber: string
  status: string
  serviceType: string
  racketBrand: string
  racketModel: string
  createdAt: string
  user: { name: string | null; email: string }
  workshop: { name: string } | null
}

interface AdminStringingTableProps {
  orders: StringingOrder[]
  onViewDetail: (id: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PICKUP_SCHEDULED: 'Recojo programado',
  RECEIVED_AT_WORKSHOP: 'Recibido en taller',
  IN_PROGRESS: 'En proceso',
  STRINGING_COMPLETED: 'Encordado completado',
  READY_FOR_PICKUP: 'Listo para recoger',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  STRINGING_CANCELLED: 'Cancelado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'primary',
  PICKUP_SCHEDULED: 'default',
  RECEIVED_AT_WORKSHOP: 'default',
  IN_PROGRESS: 'primary',
  STRINGING_COMPLETED: 'success',
  READY_FOR_PICKUP: 'success',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  STRINGING_CANCELLED: 'destructive',
}

const SERVICE_LABELS: Record<string, string> = {
  STANDARD: 'Estandar',
  EXPRESS: 'Express',
}

export default function AdminStringingTable({ orders, onViewDetail }: AdminStringingTableProps) {
  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 glass-light border-glass rounded-xl space-y-2 cursor-pointer"
            onClick={() => onViewDetail(order.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
              <GlassBadge variant={STATUS_VARIANTS[order.status] || 'default'}>
                {STATUS_LABELS[order.status] || order.status}
              </GlassBadge>
            </div>
            <div className="text-sm">
              <p className="font-medium">{order.user.name || 'Sin nombre'}</p>
              <p className="text-muted-foreground text-xs">{order.user.email}</p>
            </div>
            <div className="text-sm">
              <p>{order.racketBrand} {order.racketModel}</p>
              <p className="text-xs text-muted-foreground">{SERVICE_LABELS[order.serviceType] || order.serviceType}</p>
            </div>
            <div className="flex items-center justify-end text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('es-PE')}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">No se encontraron ordenes de encordado</p>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass text-left">
            <th className="p-3">N. Orden</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Raqueta</th>
            <th className="p-3">Servicio</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Accion</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-glass/50 hover:bg-glass/20">
              <td className="p-3 font-mono text-xs">{order.orderNumber}</td>
              <td className="p-3">
                <p className="font-medium">{order.user.name || 'Sin nombre'}</p>
                <p className="text-xs text-muted-foreground">{order.user.email}</p>
              </td>
              <td className="p-3">
                {order.racketBrand} {order.racketModel}
              </td>
              <td className="p-3">{SERVICE_LABELS[order.serviceType] || order.serviceType}</td>
              <td className="p-3">
                <GlassBadge variant={STATUS_VARIANTS[order.status] || 'default'}>
                  {STATUS_LABELS[order.status] || order.status}
                </GlassBadge>
              </td>
              <td className="p-3 text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('es-PE')}
              </td>
              <td className="p-3">
                <GlassButton variant="ghost" size="sm" onClick={() => onViewDetail(order.id)}>
                  <Eye className="h-4 w-4" />
                </GlassButton>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                No se encontraron ordenes de encordado
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  )
}
