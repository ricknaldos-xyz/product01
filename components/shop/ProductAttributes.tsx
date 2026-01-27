'use client'

const ATTRIBUTE_LABELS: Record<string, string> = {
  peso: 'Peso',
  weight: 'Peso',
  headSize: 'Tamano de cabeza',
  stringPattern: 'Patron de cuerdas',
  gripSize: 'Tamano de grip',
  balance: 'Balance',
  length: 'Longitud',
  material: 'Material',
  stiffness: 'Rigidez',
  swingWeight: 'Peso de swing',
  gauge: 'Calibre',
  tension: 'Tension',
  color: 'Color',
}

interface ProductAttributesProps {
  attributes: Record<string, string | number> | null
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(attributes).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {ATTRIBUTE_LABELS[key] || key}
          </span>
          <span className="text-sm font-medium">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}
