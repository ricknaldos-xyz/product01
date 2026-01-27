'use client'

import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { Plus, Trash2 } from 'lucide-react'

interface SetScore {
  p1: number
  p2: number
}

interface ScoreInputProps {
  value: SetScore[]
  onChange: (sets: SetScore[]) => void
}

export function ScoreInput({ value, onChange }: ScoreInputProps) {
  function addSet() {
    onChange([...value, { p1: 0, p2: 0 }])
  }

  function removeSet(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function updateSet(index: number, player: 'p1' | 'p2', score: number) {
    const clamped = Math.min(7, Math.max(0, score))
    const updated = value.map((set, i) =>
      i === index ? { ...set, [player]: clamped } : set
    )
    onChange(updated)
  }

  const scoreString = value
    .map((set) => `${set.p1}-${set.p2}`)
    .join(', ')

  return (
    <div className="space-y-3">
      {value.map((set, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-12 flex-shrink-0">
            Set {index + 1}
          </span>
          <GlassInput
            type="number"
            min={0}
            max={7}
            value={set.p1}
            onChange={(e) => updateSet(index, 'p1', parseInt(e.target.value) || 0)}
            className="w-16 text-center"
          />
          <span className="text-muted-foreground font-medium">-</span>
          <GlassInput
            type="number"
            min={0}
            max={7}
            value={set.p2}
            onChange={(e) => updateSet(index, 'p2', parseInt(e.target.value) || 0)}
            className="w-16 text-center"
          />
          {value.length > 1 && (
            <button
              type="button"
              onClick={() => removeSet(index)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      <GlassButton
        type="button"
        variant="outline"
        size="sm"
        onClick={addSet}
      >
        <Plus className="h-4 w-4 mr-1" />
        Agregar set
      </GlassButton>

      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Marcador: <span className="font-medium text-foreground">{scoreString}</span>
        </p>
      )}
    </div>
  )
}
