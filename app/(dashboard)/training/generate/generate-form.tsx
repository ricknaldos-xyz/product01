'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Dumbbell, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export function GeneratePlanForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('analysisId')
  const [generating, setGenerating] = useState(false)
  const [weeks, setWeeks] = useState(4)

  useEffect(() => {
    if (!analysisId) {
      toast.error('Analisis no especificado')
      router.push('/analyses')
    }
  }, [analysisId, router])

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/analyses/${analysisId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Generar Plan de Entrenamiento</h1>
          <p className="text-muted-foreground">
            Crea un plan personalizado basado en tu analisis
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
          <Dumbbell className="h-10 w-10 text-primary" />
          <div>
            <h3 className="font-semibold">Plan Personalizado</h3>
            <p className="text-sm text-muted-foreground">
              Ejercicios especificos para corregir los problemas detectados en tu
              tecnica
            </p>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-3">
            Duracion del plan (semanas)
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[2, 4, 6, 8].map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  weeks === w
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-lg font-semibold">{w}</span>
                <span className="block text-xs text-muted-foreground">
                  semanas
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">El plan incluira:</h4>
          <ul className="space-y-2">
            {[
              'Ejercicios especificos para cada problema detectado',
              'Progresion de dificultad a lo largo del plan',
              'Frecuencia optimizada segun severidad del problema',
              'Instrucciones detalladas para cada ejercicio',
              'Seguimiento de progreso dia a dia',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando plan...
            </>
          ) : (
            <>
              <Dumbbell className="mr-2 h-4 w-4" />
              Generar Plan de {weeks} Semanas
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
