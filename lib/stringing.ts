import { StringingOrderStatus } from '@prisma/client'

export const STRINGING_SERVICE_TYPES = {
  STANDARD: {
    label: 'Estandar',
    description: '24-48 horas',
    priceCents: 2500,
  },
  EXPRESS: {
    label: 'Express',
    description: 'Mismo dia',
    priceCents: 4500,
  },
} as const

export type StringingServiceType = keyof typeof STRINGING_SERVICE_TYPES

export const DELIVERY_MODES = {
  HOME_PICKUP_DELIVERY: {
    label: 'Recojo y entrega a domicilio',
    priceCents: 1500,
  },
  WORKSHOP_DROP_PICKUP: {
    label: 'Dejar y recoger en taller',
    priceCents: 0,
  },
} as const

export type DeliveryMode = keyof typeof DELIVERY_MODES

export const STRINGING_STATUS_LABELS: Record<
  StringingOrderStatus,
  { label: string; color: string }
> = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'blue' },
  PICKUP_SCHEDULED: { label: 'Recojo programado', color: 'indigo' },
  RECEIVED_AT_WORKSHOP: { label: 'Recibido en taller', color: 'cyan' },
  IN_PROGRESS: { label: 'En proceso', color: 'purple' },
  STRINGING_COMPLETED: { label: 'Encordado completado', color: 'teal' },
  READY_FOR_PICKUP: { label: 'Listo para recoger', color: 'emerald' },
  OUT_FOR_DELIVERY: { label: 'En camino', color: 'orange' },
  DELIVERED: { label: 'Entregado', color: 'green' },
  STRINGING_CANCELLED: { label: 'Cancelado', color: 'red' },
}

export const STRINGING_STATUS_FLOW: Record<
  StringingOrderStatus,
  StringingOrderStatus[]
> = {
  PENDING_PAYMENT: ['CONFIRMED', 'STRINGING_CANCELLED'],
  CONFIRMED: ['PICKUP_SCHEDULED', 'RECEIVED_AT_WORKSHOP', 'STRINGING_CANCELLED'],
  PICKUP_SCHEDULED: ['RECEIVED_AT_WORKSHOP', 'STRINGING_CANCELLED'],
  RECEIVED_AT_WORKSHOP: ['IN_PROGRESS', 'STRINGING_CANCELLED'],
  IN_PROGRESS: ['STRINGING_COMPLETED', 'STRINGING_CANCELLED'],
  STRINGING_COMPLETED: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'],
  READY_FOR_PICKUP: ['DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  STRINGING_CANCELLED: [],
}

export function generateStringingOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `STR-${year}${month}${day}-${random}`
}

export const RECOMMENDED_TENSIONS = {
  min: 45,
  max: 65,
  default: 55,
} as const
