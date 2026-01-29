'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { toast } from 'sonner'
import { Loader2, Dumbbell, ArrowLeft, Check, Star, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const DURATION_OPTIONS = [
  { weeks: 2, label: 'Ajuste rapido', description: 'Correcciones puntuales para problemas leves' },
  { weeks: 4, label: 'Correccion progresiva', description: 'Tiempo ideal para consolidar mejoras tecnicas' },
  { weeks: 6, label: 'Transformacion tecnica', description: 'Trabajo profundo para problemas criticos' },
  { weeks: 8, label: 'Dominio completo', description: 'Programa intensivo de perfeccionamiento total' },
]

interface Recommendation {
  recommendedWeeks: number
  techniqueName: string
  issuesSummary: { critical: number; high: number; medium: number; low: number; total: number }
}

export function GeneratePlanForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('analysisId')
  const goalId = searchParams.get('goalId')
  const [generating, setGenerating] = useState(false)
  const [weeks, setWeeks] = useState(4)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loadingRec, setLoadingRec] = useState(true)

  const fetchRecommendation = useCallback(async () => {
    if (!analysisId) return
    try {
      const res = await fetch(`/api/training-plans/recommend?analysisId=${analysisId}`)
      if (res.ok) {
        const data: Recommendation = await res.json()
        setRecommendation(data)
        setWeeks(data.recommendedWeeks)
      }
    } catch {
      // Silently fail, use default
    } finally {
      setLoadingRec(false)
    }
  }, [analysisId])

  useEffect(() => {
    if (!analysisId) {
      toast.error('Analisis no especificado')
      router.push('/analyses')
      return
    }
    fetchRecommendation()
  }, [analysisId, router, fetchRecommendation])

  const handleGenerate = async () => {
    if (!analysisId) return

    setGenerating(true)

    try {
      const response = await fetch('/api/training-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          durationWeeks: weeks,
          ...(goalId && { goalId }),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al generar plan')
      }

      const plan = await response.json()
      toast.success('Plan de entrenamiento generado!')
      router.push(`/training/${plan.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al generar plan')
      setGenerating(false)
    }
  }

  const summary = recommendation?.issuesSummary

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href={`/analyses/${analysisId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Tu Plan de Mejora Personalizado</h1>
          <p className="text-muted-foreground">
            {recommendation
              ? `Basado en ${summary?.total} problema${summary?.total !== 1 ? 's' : ''} detectado${summary?.total !== 1 ? 's' : ''} en tu ${recommendation.techniqueName}`
              : 'Crea un plan personalizado basado en tu analisis'}
          </p>
        </div>
      </div>

      <GlassCard intensity="medium" padding="lg" className="space-y-6">
        {/* Issues summary */}
        {summary && summary.total > 0 && (
          <div className="flex items-center gap-3 p-4 glass-ultralight border-glass rounded-xl">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Problemas detectados: </span>
              {[
                summary.critical > 0 && `${summary.critical} critico${summary.critical > 1 ? 's' : ''}`,
                summary.high > 0 && `${summary.high} alto${summary.high > 1 ? 's' : ''}`,
                summary.medium > 0 && `${summary.medium} medio${summary.medium > 1 ? 's' : ''}`,
                summary.low > 0 && `${summary.low} leve${summary.low > 1 ? 's' : ''}`,
              ].filter(Boolean).join(', ')}
            </div>
          </div>
        )}

        {/* Duration selector */}
        <div>
          <label className="block font-medium mb-3">
            Elige la duracion de tu plan
          </label>
          <div className="grid grid-cols-2 gap-3">
            {loadingRec ? (
              <div className="col-span-2 flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              DURATION_OPTIONS.map((option) => {
                const isRecommended = recommendation?.recommendedWeeks === option.weeks
                const isSelected = weeks === option.weeks
                return (
                  <button
                    key={option.weeks}
                    onClick={() => setWeeks(option.weeks)}
                    className={cn(
                      'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)] relative',
                      isSelected
                        ? 'glass-primary border-glass shadow-glass-glow'
                        : 'glass-ultralight border-glass hover:glass-light'
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="h-2.5 w-2.5" />
                        Recomendado
                      </span>
                    )}
                    <span className={cn(
                      'text-xl font-bold block',
                      isSelected ? 'text-primary' : ''
                    )}>
                      {option.weeks} semanas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {option.label}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Plan includes */}
        <div className="space-y-3">
          <h4 className="font-medium">Tu plan incluira:</h4>
          <ul className="space-y-2">
            {[
              'Ejercicios especificos para cada problema detectado',
              'Progresion de dificultad semana a semana',
              'Frecuencia optimizada segun severidad del problema',
              'Instrucciones detalladas paso a paso',
              'Seguimiento de progreso dia a dia',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="bg-success/20 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-success" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <GlassButton
          onClick={handleGenerate}
          disabled={generating || loadingRec}
          variant="solid"
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando tu plan personalizado...
            </>
          ) : (
            <>
              <Dumbbell className="mr-2 h-4 w-4" />
              Generar Plan de {weeks} Semanas
            </>
          )}
        </GlassButton>
      </GlassCard>
    </div>
  )
}
