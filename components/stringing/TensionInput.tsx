'use client'

import { useRef } from 'react'
import { GlassInput, GlassToggle } from '@/components/ui/glass-input'

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
  const barRef = useRef<HTMLDivElement>(null)

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    const tension = Math.round(30 + pct * 50)
    onMainChange(tension)
  }

  const markerPct = ((tensionMain - 30) / 50) * 100
  const recMinPct = ((45 - 30) / 50) * 100
  const recWidthPct = ((65 - 45) / 50) * 100

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Tension principales (lbs) *
        </label>
        <div className="relative">
          <GlassInput
            type="number"
            className="w-full pr-12"
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

      {/* Tension Spectrum Bar */}
      <div>
        <div
          ref={barRef}
          className="relative h-3 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 cursor-pointer"
          onClick={handleBarClick}
        >
          {/* Recommended zone overlay */}
          <div
            className="absolute top-0 h-full bg-green-500/20 rounded-full"
            style={{ left: `${recMinPct}%`, width: `${recWidthPct}%` }}
          />
          {/* Marker dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background border-2 border-primary shadow-md pointer-events-none"
            style={{ left: `${Math.max(0, Math.min(100, markerPct))}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Potencia</span>
          <span className="text-xs text-muted-foreground">Control</span>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <GlassToggle
          checked={sameTension}
          onCheckedChange={(checked) => {
            onSameTensionChange(checked)
            if (checked && onCrossChange) {
              onCrossChange(undefined)
            }
          }}
          aria-label="Misma tension para cruzadas"
        />
        <span className="text-sm">Misma tension para cruzadas</span>
      </label>

      {!sameTension && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Tension cruzadas (lbs)
          </label>
          <div className="relative">
            <GlassInput
              type="number"
              className="w-full pr-12"
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
