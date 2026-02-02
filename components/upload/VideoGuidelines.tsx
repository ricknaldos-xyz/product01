'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Example {
  label: string
  isGood: boolean
  description: string
}

const examples: Example[] = [
  {
    label: 'Cuerpo completo visible',
    isGood: true,
    description: 'Asegurate de que todo tu cuerpo se vea en el video',
  },
  {
    label: 'Angulo lateral o 45',
    isGood: true,
    description: 'Los mejores resultados vienen de angulos laterales',
  },
  {
    label: 'Buena iluminacion',
    isGood: true,
    description: 'Graba con luz natural o iluminacion uniforme',
  },
  {
    label: 'Fondo limpio',
    isGood: true,
    description: 'Un fondo simple ayuda a la IA a enfocarse en ti',
  },
  {
    label: 'Video muy oscuro',
    isGood: false,
    description: 'La IA no puede ver detalles en videos oscuros',
  },
  {
    label: 'Movimiento borroso',
    isGood: false,
    description: 'Usa buena iluminacion para evitar blur',
  },
  {
    label: 'Muy lejos',
    isGood: false,
    description: 'Acercate para que la IA vea los detalles de tu tecnica',
  },
  {
    label: 'Cuerpo cortado',
    isGood: false,
    description: 'Todo tu cuerpo debe estar visible en el encuadre',
  },
]

export function VideoGuidelines() {
  const [isExpanded, setIsExpanded] = useState(false)

  const goodExamples = examples.filter((e) => e.isGood)
  const badExamples = examples.filter((e) => !e.isGood)

  return (
    <div className="glass-ultralight border-glass rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-4 hover:glass-light transition-all duration-[var(--duration-normal)]"
      >
        <div className="flex items-center gap-3">
          <div className="glass-primary border-glass rounded-lg p-2">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">Tips para un mejor analisis</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Good examples */}
          <div>
            <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Recomendado
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {goodExamples.map((example) => (
                <div
                  key={example.label}
                  className="bg-success/5 border border-success/20 rounded-xl p-3"
                >
                  <p className="text-sm font-medium text-success">
                    {example.label}
                  </p>
                  <p className="text-xs text-success/80 mt-1">
                    {example.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bad examples */}
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
              <X className="h-4 w-4" />
              Evitar
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {badExamples.map((example) => (
                <div
                  key={example.label}
                  className="bg-destructive/5 border border-destructive/20 rounded-xl p-3"
                >
                  <p className="text-sm font-medium text-destructive">
                    {example.label}
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    {example.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
