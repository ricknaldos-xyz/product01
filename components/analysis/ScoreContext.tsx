'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'

interface ScoreContextProps {
  score: number
  averageScore?: number
  previousScore?: number
  benchmarkScore?: number
}

const DEFAULT_BENCHMARK = 6.2 // Average score for recreational players

function getScoreLabel(score: number): { label: string; color: string; description: string } {
  if (score >= 9) {
    return {
      label: 'Excelente',
      color: 'text-green-600',
      description: 'Tu tecnica es de nivel profesional',
    }
  }
  if (score >= 8) {
    return {
      label: 'Muy bueno',
      color: 'text-green-500',
      description: 'Tu tecnica esta muy bien desarrollada',
    }
  }
  if (score >= 7) {
    return {
      label: 'Bueno',
      color: 'text-blue-500',
      description: 'Tu tecnica es solida con algunas areas de mejora',
    }
  }
  if (score >= 6) {
    return {
      label: 'Promedio',
      color: 'text-yellow-600',
      description: 'Tu tecnica tiene buen potencial',
    }
  }
  if (score >= 5) {
    return {
      label: 'En desarrollo',
      color: 'text-orange-500',
      description: 'Hay varias areas que puedes mejorar',
    }
  }
  return {
    label: 'Necesita trabajo',
    color: 'text-red-500',
    description: 'Enfocate en los fundamentos basicos',
  }
}

export function ScoreContext({ score, averageScore, previousScore, benchmarkScore }: ScoreContextProps) {
  const benchmark = averageScore || benchmarkScore || DEFAULT_BENCHMARK
  const scoreInfo = getScoreLabel(score)
  const difference = score - benchmark
  const previousDifference = previousScore ? score - previousScore : null

  const isAboveAverage = difference > 0
  const isImproving = previousDifference !== null && previousDifference > 0

  return (
    <GlassCard intensity="light" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={cn('text-lg font-semibold', scoreInfo.color)}>
            {scoreInfo.label}
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            {scoreInfo.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Comparison to average */}
        <div className="glass-ultralight border-glass rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">vs Promedio</p>
          <div className="flex items-center gap-2">
            {isAboveAverage ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : difference === 0 ? (
              <Minus className="h-4 w-4 text-warning" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span
              className={cn(
                'font-medium',
                isAboveAverage
                  ? 'text-success'
                  : difference === 0
                  ? 'text-warning'
                  : 'text-destructive'
              )}
            >
              {difference > 0 ? '+' : ''}
              {difference.toFixed(1)} puntos
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Promedio: {benchmark.toFixed(1)}/10
          </p>
        </div>

        {/* Comparison to previous */}
        {previousDifference !== null && (
          <div className="glass-ultralight border-glass rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">vs Anterior</p>
            <div className="flex items-center gap-2">
              {isImproving ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : previousDifference === 0 ? (
                <Minus className="h-4 w-4 text-warning" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  'font-medium',
                  isImproving
                    ? 'text-success'
                    : previousDifference === 0
                    ? 'text-warning'
                    : 'text-destructive'
                )}
              >
                {previousDifference > 0 ? '+' : ''}
                {previousDifference.toFixed(1)} puntos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isImproving ? 'Mejoraste!' : 'Sigue practicando'}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
