'use client'

import { GlassButton } from '@/components/ui/glass-button'

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'RACKETS', label: 'Raquetas' },
  { value: 'STRINGS', label: 'Cuerdas' },
  { value: 'GRIPS', label: 'Grips' },
  { value: 'BAGS', label: 'Bolsos' },
  { value: 'SHOES', label: 'Zapatillas' },
  { value: 'APPAREL', label: 'Ropa' },
  { value: 'ACCESSORIES', label: 'Accesorios' },
]

interface CategoryNavProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryNav({ selected, onSelect }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map((cat) => (
        <GlassButton
          key={cat.value}
          variant={selected === cat.value ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onSelect(cat.value)}
          className="flex-shrink-0"
        >
          {cat.label}
        </GlassButton>
      ))}
    </div>
  )
}
