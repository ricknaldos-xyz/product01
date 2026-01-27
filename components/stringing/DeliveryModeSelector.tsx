'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { Truck, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/shop'

type DeliveryMode = 'HOME_PICKUP_DELIVERY' | 'WORKSHOP_DROP_PICKUP'

const DELIVERY_INFO: Record<DeliveryMode, {
  name: string
  description: string
  priceCents: number
  icon: typeof Truck
  iconColor: string
  iconBg: string
}> = {
  HOME_PICKUP_DELIVERY: {
    name: 'A Domicilio',
    description: 'Recogemos y entregamos en tu direccion',
    priceCents: 1500,
    icon: Truck,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
  },
  WORKSHOP_DROP_PICKUP: {
    name: 'En Taller',
    description: 'Llevas y recoges en el taller',
    priceCents: 0,
    icon: MapPin,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
  },
}

interface DeliveryModeSelectorProps {
  selected: DeliveryMode
  onSelect: (mode: DeliveryMode) => void
}

export function DeliveryModeSelector({ selected, onSelect }: DeliveryModeSelectorProps) {
  const modes: DeliveryMode[] = ['HOME_PICKUP_DELIVERY', 'WORKSHOP_DROP_PICKUP']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modes.map((mode) => {
        const info = DELIVERY_INFO[mode]
        const Icon = info.icon
        const isSelected = selected === mode

        return (
          <GlassCard
            key={mode}
            intensity={isSelected ? 'medium' : 'light'}
            padding="md"
            hover="lift"
            className={`cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-primary border-primary/30' : ''
            }`}
            onClick={() => onSelect(mode)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${info.iconBg}`}>
                <Icon className={`h-5 w-5 ${info.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-muted-foreground/30'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <h3 className="font-semibold">{info.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                <p className="text-lg font-bold mt-2">
                  {info.priceCents === 0 ? 'Gratis' : formatPrice(info.priceCents)}
                </p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
