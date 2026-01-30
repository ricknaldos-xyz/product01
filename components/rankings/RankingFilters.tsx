'use client'

import { GlassButton } from '@/components/ui/glass-button'

const tierOptions = [
  { value: '', label: 'Todos' },
  { value: 'PRIMERA_A,PRIMERA_B', label: '1ra' },
  { value: 'SEGUNDA_A,SEGUNDA_B', label: '2da' },
  { value: 'TERCERA_A,TERCERA_B', label: '3ra' },
  { value: 'CUARTA_A,CUARTA_B', label: '4ta' },
  { value: 'QUINTA_A,QUINTA_B', label: '5ta' },
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
