'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Clock, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/shop'

const SERVICE_INFO = {
  STANDARD: {
    name: 'Estandar',
    description: 'Entrega en 24-48 horas habiles',
    priceCents: 2500,
    icon: Clock,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  EXPRESS: {
    name: 'Express',
    description: 'Entrega el mismo dia',
    priceCents: 4500,
    icon: Zap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
  },
} as const

interface StringingServiceCardProps {
  type: 'STANDARD' | 'EXPRESS'
  selected: boolean
  onSelect: () => void
}

export function StringingServiceCard({ type, selected, onSelect }: StringingServiceCardProps) {
  const info = SERVICE_INFO[type]
  const Icon = info.icon

  return (
    <GlassCard
      intensity={selected ? 'medium' : 'light'}
      padding="md"
      hover="lift"
      className={`cursor-pointer transition-all ${
        selected ? 'ring-2 ring-primary border-primary/30' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${info.iconBg}`}>
          <Icon className={`h-5 w-5 ${info.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selected ? 'border-primary' : 'border-muted-foreground/30'
              }`}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <h3 className="font-semibold">{info.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
          <p className="text-lg font-bold mt-2">{formatPrice(info.priceCents)}</p>
        </div>
      </div>
    </GlassCard>
  )
}
