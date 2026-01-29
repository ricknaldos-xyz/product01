'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Trophy,
  Medal,
  Loader2,
  Check,
  Zap,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import type { GoalType } from '@prisma/client'

interface Technique {
  id: string
  name: string
  slug: string
  sport: { id: string; name: string }
}

interface Template {
  type: string
  label: string
  icon: string
  techniqueIds: string[]
  targetScore?: number
  targetTier?: string
}

const GOAL_TYPES: {
  value: GoalType
  icon: React.ReactNode
  title: string
  description: string
}[] = [
  {
    value: 'TECHNIQUE',
    icon: <Target className="h-8 w-8" />,
    title: 'Mejorar una Tecnica',
    description: 'Enfocate en perfeccionar una tecnica especifica',
  },
  {
    value: 'SCORE_TARGET',
    icon: <Trophy className="h-8 w-8" />,
    title: 'Alcanzar un Puntaje',
    description: 'Fija un puntaje objetivo para tus analisis',
  },
  {
    value: 'TIER_TARGET',
    icon: <Medal className="h-8 w-8" />,
    title: 'Subir de Nivel',
    description: 'Alcanza el siguiente nivel en el ranking',
  },
]

const TIER_OPTIONS = [
  { value: 'PLATA', label: 'Plata' },
  { value: 'ORO', label: 'Oro' },
  { value: 'PLATINO', label: 'Platino' },
  { value: 'DIAMANTE', label: 'Diamante' },
]

const templateIcons: Record<string, React.ReactNode> = {
  zap: <Zap className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  layers: <Layers className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  medal: <Medal className="h-5 w-5" />,
}

export function CreateGoalForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goalType, setGoalType] = useState<GoalType | null>(null)
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [targetScore, setTargetScore] = useState(8)
  const [targetTier, setTargetTier] = useState<string | null>(null)
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch('/api/goals/templates')
        if (res.ok) {
          const data = await res.json()
          setTemplates(data)
        }
      } catch {
        // Silently fail - templates are optional
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch techniques when we go to step 2
  useEffect(() => {
    if (step === 2 && techniques.length === 0) {
      fetchTechniques()
    }
  }, [step])

  async function fetchTechniques() {
    try {
      // First fetch available sports
      const sportsRes = await fetch('/api/sports')
      if (!sportsRes.ok) return

      const sports: { id: string; name: string; slug: string }[] = await sportsRes.json()
      const allTechniques: Technique[] = []

      // Then fetch techniques for each sport
      for (const sport of sports) {
        const techRes = await fetch(`/api/sports/${sport.id}/techniques`)
        if (techRes.ok) {
          const techs: { id: string; name: string; slug: string }[] = await techRes.json()
          allTechniques.push(
            ...techs.map((t) => ({ ...t, sport: { id: sport.id, name: sport.name } }))
          )
        }
      }

      setTechniques(allTechniques)
    } catch {
      toast.error('Error al cargar las tecnicas')
    }
  }

  function handleTemplateSelect(template: Template) {
    setGoalType(template.type as GoalType)
    setSelectedTechniques(template.techniqueIds)
    if (template.targetScore) setTargetScore(template.targetScore)
    if (template.targetTier) setTargetTier(template.targetTier)
    setStep(3)
  }

  function toggleTechnique(id: string) {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleCreate() {
    if (!goalType || selectedTechniques.length === 0) {
      toast.error('Selecciona al menos una tecnica')
      return
    }

    setCreating(true)
    try {
      const body: Record<string, unknown> = {
        type: goalType,
        techniqueIds: selectedTechniques,
      }

      if (goalType === 'SCORE_TARGET') {
        body.targetScore = targetScore
      }
      if (goalType === 'TIER_TARGET' && targetTier) {
        body.targetTier = targetTier
      }

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const goal = await res.json()
        toast.success('Objetivo creado exitosamente')
        router.push(`/goals/${goal.id}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al crear el objetivo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setCreating(false)
    }
  }

  const canProceedStep2 =
    selectedTechniques.length > 0 &&
    (goalType !== 'SCORE_TARGET' || targetScore > 0) &&
    (goalType !== 'TIER_TARGET' || targetTier != null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/goals" className="hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Objetivos
        </Link>
        <span>/</span>
        <span className="text-foreground">Crear objetivo</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Crear objetivo</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-light border-glass text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 rounded-full transition-all ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {step === 1
            ? 'Tipo de objetivo'
            : step === 2
            ? 'Configuracion'
            : 'Revisar y crear'}
        </span>
      </div>

      {/* Step 1: Choose type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {GOAL_TYPES.map((type) => (
              <GlassCard
                key={type.value}
                intensity={goalType === type.value ? 'primary' : 'light'}
                padding="lg"
                hover="glow"
                className="cursor-pointer"
                onClick={() => {
                  setGoalType(type.value)
                  setSelectedTechniques([])
                  setTargetTier(null)
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="glass-light border-glass rounded-xl p-3 text-primary">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  {goalType === type.value && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Plantillas rapidas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template, i) => (
                  <GlassCard
                    key={i}
                    intensity="ultralight"
                    padding="md"
                    hover="lift"
                    className="cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-primary">
                        {templateIcons[template.icon] || (
                          <Target className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{template.label}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <GlassButton
              variant="solid"
              onClick={() => setStep(2)}
              disabled={!goalType}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Technique selector */}
          <GlassCard intensity="medium" padding="lg">
            <h3 className="font-semibold mb-3">
              {goalType === 'TIER_TARGET'
                ? 'Selecciona las tecnicas para tu objetivo'
                : 'Selecciona las tecnicas'}
            </h3>

            {techniques.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {techniques.map((tech) => (
                  <GlassCard
                    key={tech.id}
                    intensity={
                      selectedTechniques.includes(tech.id)
                        ? 'primary'
                        : 'ultralight'
                    }
                    padding="sm"
                    hover="lift"
                    className="cursor-pointer"
                    onClick={() => toggleTechnique(tech.id)}
                  >
                    <div className="flex items-center gap-2">
                      {selectedTechniques.includes(tech.id) && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tech.sport.name}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Score target input */}
          {goalType === 'SCORE_TARGET' && (
            <GlassCard intensity="medium" padding="lg">
              <h3 className="font-semibold mb-3">Puntaje objetivo</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <div className="glass-primary border-glass rounded-xl px-4 py-2 text-center min-w-[60px]">
                  <span className="text-2xl font-bold text-primary">
                    {targetScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Tier selector */}
          {goalType === 'TIER_TARGET' && (
            <GlassCard intensity="medium" padding="lg">
              <h3 className="font-semibold mb-3">Nivel objetivo</h3>
              <div className="grid grid-cols-2 gap-3">
                {TIER_OPTIONS.map((tier) => (
                  <GlassCard
                    key={tier.value}
                    intensity={targetTier === tier.value ? 'primary' : 'ultralight'}
                    padding="md"
                    hover="glow"
                    className="cursor-pointer text-center"
                    onClick={() => setTargetTier(tier.value)}
                  >
                    <Medal className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-medium">{tier.label}</p>
                  </GlassCard>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="flex justify-between">
            <GlassButton variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atras
            </GlassButton>
            <GlassButton
              variant="solid"
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="space-y-6">
          <GlassCard intensity="medium" padding="xl">
            <h3 className="font-semibold mb-4">Resumen del objetivo</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="glass-light border-glass rounded-xl p-2 text-primary">
                  {goalType === 'TECHNIQUE' ? (
                    <Target className="h-5 w-5" />
                  ) : goalType === 'SCORE_TARGET' ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <Medal className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {goalType === 'TECHNIQUE'
                      ? 'Mejorar tecnica'
                      : goalType === 'SCORE_TARGET'
                      ? 'Alcanzar puntaje'
                      : 'Subir de nivel'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Tecnicas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTechniques.map((id) => {
                    const tech = techniques.find((t) => t.id === id)
                    return (
                      <GlassBadge key={id} variant="primary">
                        {tech?.name ?? id}
                      </GlassBadge>
                    )
                  })}
                </div>
              </div>

              {goalType === 'SCORE_TARGET' && (
                <div>
                  <p className="text-sm text-muted-foreground">Puntaje objetivo</p>
                  <p className="text-xl font-bold text-primary">{targetScore}/10</p>
                </div>
              )}

              {goalType === 'TIER_TARGET' && targetTier && (
                <div>
                  <p className="text-sm text-muted-foreground">Nivel objetivo</p>
                  <p className="text-xl font-bold text-primary">
                    {TIER_OPTIONS.find((t) => t.value === targetTier)?.label ??
                      targetTier}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {creating && (
            <GlassCard intensity="light" padding="lg" className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">
                Creando tu objetivo y generando el roadmap con IA...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esto puede tomar unos segundos
              </p>
            </GlassCard>
          )}

          <div className="flex justify-between">
            <GlassButton
              variant="outline"
              onClick={() => setStep(2)}
              disabled={creating}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atras
            </GlassButton>
            <GlassButton
              variant="solid"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Crear Objetivo
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  )
}
