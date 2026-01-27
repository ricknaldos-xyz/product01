'use client'

import { GlassButton } from '@/components/ui/glass-button'

interface ProductFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedSort: string
  onSortChange: (sort: string) => void
}

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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'price_asc', label: 'Precio menor' },
  { value: 'price_desc', label: 'Precio mayor' },
  { value: 'featured', label: 'Destacados' },
]

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <GlassButton
            key={cat.value}
            variant={selectedCategory === cat.value ? 'solid' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(cat.value)}
          >
            {cat.label}
          </GlassButton>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Ordenar por:</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="glass-input text-sm py-1.5 px-3 rounded-xl"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
