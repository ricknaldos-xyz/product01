'use client'

import { GlassBadge } from '@/components/ui/glass-badge'
import { GlassButton } from '@/components/ui/glass-button'
import { formatPrice } from '@/lib/shop'
import { Eye } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalCents: number
  createdAt: string
  user: { name: string | null; email: string }
  _count: { items: number }
}

interface AdminOrderTableProps {
  orders: Order[]
  onViewDetail: (id: string) => void
}

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'primary',
  PROCESSING: 'default',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

export default function AdminOrderTable({ orders, onViewDetail }: AdminOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-glass text-left">
            <th className="p-3">N. Pedido</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3">Estado</th>
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
              <td className="p-3 text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('es-PE')}
              </td>
              <td className="p-3">{order._count.items}</td>
              <td className="p-3 font-medium">{formatPrice(order.totalCents)}</td>
              <td className="p-3">
                <GlassBadge variant={STATUS_VARIANTS[order.status] || 'default'}>
                  {STATUS_LABELS[order.status] || order.status}
                </GlassBadge>
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
                No se encontraron pedidos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
