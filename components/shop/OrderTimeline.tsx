'use client'

import { Check, Circle } from 'lucide-react'

interface OrderTimelineProps {
  order: {
    status: string
    createdAt: string
    paidAt: string | null
    shippedAt: string | null
    deliveredAt: string | null
    cancelledAt: string | null
  }
}

const STEPS = [
  { key: 'created', label: 'Pedido creado', dateField: 'createdAt' },
  { key: 'paid', label: 'Pago confirmado', dateField: 'paidAt' },
  { key: 'processing', label: 'En proceso', dateField: null },
  { key: 'shipped', label: 'Enviado', dateField: 'shippedAt' },
  { key: 'delivered', label: 'Entregado', dateField: 'deliveredAt' },
]

const STATUS_ORDER: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentStep = STATUS_ORDER[order.status] ?? 0

  if (order.cancelledAt) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <Circle className="h-4 w-4 text-destructive fill-destructive" />
          </div>
          <div>
            <p className="font-medium text-sm text-destructive">Pedido cancelado</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.cancelledAt)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentStep
        const isActive = index === currentStep
        const dateValue = step.dateField
          ? (order as Record<string, string | null>)[step.dateField]
          : null

        return (
          <div key={step.key} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    index < currentStep ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-4">
              <p
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-primary'
                    : isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
              {dateValue && (
                <p className="text-xs text-muted-foreground">{formatDate(dateValue)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
