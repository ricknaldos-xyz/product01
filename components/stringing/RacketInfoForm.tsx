'use client'

interface RacketInfoFormProps {
  brand: string
  model: string
  notes: string
  onChange: (field: 'brand' | 'model' | 'notes', value: string) => void
}

export function RacketInfoForm({ brand, model, notes, onChange }: RacketInfoFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Marca de la Raqueta *
        </label>
        <input
          type="text"
          className="glass-input w-full"
          placeholder="Ej: Wilson, Babolat, Head"
          value={brand}
          onChange={(e) => onChange('brand', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Modelo *
        </label>
        <input
          type="text"
          className="glass-input w-full"
          placeholder="Ej: Pro Staff 97, Pure Aero, Speed MP"
          value={model}
          onChange={(e) => onChange('model', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Notas adicionales (opcional)
        </label>
        <textarea
          className="glass-input w-full min-h-[80px] resize-y"
          placeholder="Ej: Tiene grip nuevo, protector de marco, etc."
          maxLength={500}
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">{notes.length}/500</p>
      </div>
    </div>
  )
}
