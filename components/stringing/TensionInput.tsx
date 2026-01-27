'use client'

interface TensionInputProps {
  tensionMain: number
  tensionCross?: number
  onMainChange: (value: number) => void
  onCrossChange?: (value: number | undefined) => void
  sameTension: boolean
  onSameTensionChange: (value: boolean) => void
}

export function TensionInput({
  tensionMain,
  tensionCross,
  onMainChange,
  onCrossChange,
  sameTension,
  onSameTensionChange,
}: TensionInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Tension principales (lbs) *
        </label>
        <div className="relative">
          <input
            type="number"
            className="glass-input w-full pr-12"
            min={30}
            max={80}
            value={tensionMain}
            onChange={(e) => onMainChange(Number(e.target.value))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            lbs
          </span>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sameTension}
          onChange={(e) => {
            onSameTensionChange(e.target.checked)
            if (e.target.checked && onCrossChange) {
              onCrossChange(undefined)
            }
          }}
          className="rounded border-glass"
        />
        <span className="text-sm">Misma tension para cruzadas</span>
      </label>

      {!sameTension && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Tension cruzadas (lbs)
          </label>
          <div className="relative">
            <input
              type="number"
              className="glass-input w-full pr-12"
              min={30}
              max={80}
              value={tensionCross ?? tensionMain}
              onChange={(e) => onCrossChange?.(Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              lbs
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recomendado: 45-65 lbs. Una tension mas baja da mas potencia, una mas alta da mas control.
      </p>
    </div>
  )
}
