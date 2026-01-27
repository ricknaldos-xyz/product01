import { ProductCategory, OrderStatus } from '@prisma/client'

export type { ProductCategory } from '@prisma/client'

export const PRODUCT_CATEGORIES: Record<
  ProductCategory,
  { label: string; icon: string }
> = {
  RACKETS: { label: 'Raquetas', icon: 'Racquet' },
  STRINGS: { label: 'Cuerdas', icon: 'Cable' },
  GRIPS: { label: 'Grips', icon: 'Grip' },
  BAGS: { label: 'Bolsos', icon: 'Briefcase' },
  SHOES: { label: 'Zapatillas', icon: 'Footprints' },
  APPAREL: { label: 'Ropa', icon: 'Shirt' },
  ACCESSORIES: { label: 'Accesorios', icon: 'Package' },
}

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', color: 'yellow' },
  PAID: { label: 'Pagado', color: 'blue' },
  PROCESSING: { label: 'En proceso', color: 'indigo' },
  SHIPPED: { label: 'Enviado', color: 'purple' },
  DELIVERED: { label: 'Entregado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
  REFUNDED: { label: 'Reembolsado', color: 'gray' },
}

export function formatPrice(centimos: number): string {
  const soles = centimos / 100
  return `S/ ${soles.toFixed(2)}`
}

export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${year}${month}${day}-${random}`
}

export function calculateShipping(_district: string): number {
  // Flat rate for Lima: S/ 15.00
  return 1500
}
