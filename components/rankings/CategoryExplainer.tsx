'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { getTierLabel, getTierColor } from '@/lib/skill-score'
import type { SkillTier } from '@prisma/client'

interface CategoryExplainerProps {
  currentTier?: string
}

const CATEGORIES: { tier: SkillTier; min: number; max: number }[] = [
  { tier: 'PRIMERA_A', min: 90, max: 100 },
  { tier: 'PRIMERA_B', min: 80, max: 89.9 },
  { tier: 'SEGUNDA_A', min: 70, max: 79.9 },
  { tier: 'SEGUNDA_B', min: 60, max: 69.9 },
  { tier: 'TERCERA_A', min: 50, max: 59.9 },
  { tier: 'TERCERA_B', min: 40, max: 49.9 },
  { tier: 'CUARTA_A', min: 30, max: 39.9 },
  { tier: 'CUARTA_B', min: 20, max: 29.9 },
  { tier: 'QUINTA_A', min: 10, max: 19.9 },
  { tier: 'QUINTA_B', min: 0, max: 9.9 },
]

export function CategoryExplainer({ currentTier }: CategoryExplainerProps) {
  const [open, setOpen] = useState(false)

  return (
    <GlassCard intensity="light" padding="none" className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="font-medium text-sm">Como funciona el sistema de categorias</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[600px] pb-4 px-4' : 'max-h-0'
        }`}
      >
        <div className="space-y-1 mb-4">
          {CATEGORIES.map(({ tier, min, max }) => {
            const isActive = currentTier === tier
            return (
              <div
                key={tier}
                className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-sm ${
                  isActive ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${getTierColor(tier).replace('text-', 'bg-')}`} />
                  <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                    {getTierLabel(tier)}
                  </span>
                </div>
                <span className="text-muted-foreground tabular-nums text-xs">
                  {min} - {max}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tu categoria se calcula automaticamente a partir del analisis de video de tus tecnicas.
          Analiza al menos 3 tecnicas diferentes para obtener tu categoria.
        </p>
      </div>
    </GlassCard>
  )
}
