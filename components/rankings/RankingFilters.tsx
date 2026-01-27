'use client'

import { GlassButton } from '@/components/ui/glass-button'

const tierOptions = [
  { value: '', label: 'Todos' },
  { value: 'DIAMANTE', label: 'Diamante' },
  { value: 'PLATINO', label: 'Platino' },
  { value: 'ORO', label: 'Oro' },
  { value: 'PLATA', label: 'Plata' },
  { value: 'BRONCE', label: 'Bronce' },
]

interface RankingFiltersProps {
  tierFilter: string
  onTierChange: (tier: string) => void
  periodFilter?: string
  onPeriodChange?: (period: string) => void
}

export function RankingFilters({
  tierFilter,
  onTierChange,
  periodFilter,
  onPeriodChange,
}: RankingFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tierOptions.map((option) => (
        <GlassButton
          key={option.value}
          variant={tierFilter === option.value ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onTierChange(option.value)}
        >
          {option.label}
        </GlassButton>
      ))}

      {onPeriodChange && (
        <>
          <div className="w-px bg-glass-border-light mx-1 self-stretch" />
          {[
            { value: 'all', label: 'Todo' },
            { value: 'month', label: 'Mes' },
            { value: 'week', label: 'Semana' },
          ].map((option) => (
            <GlassButton
              key={option.value}
              variant={periodFilter === option.value ? 'solid' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange(option.value)}
            >
              {option.label}
            </GlassButton>
          ))}
        </>
      )}
    </div>
  )
}
