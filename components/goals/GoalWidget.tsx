import Link from 'next/link'
import { Target, ChevronRight, ArrowRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'

interface RoadmapStep {
  order: number
  title: string
  type: 'analysis' | 'training'
  completed: boolean
}

function getNextStep(roadmap: unknown): RoadmapStep | null {
  if (!roadmap || typeof roadmap !== 'object') return null
  const r = roadmap as { steps?: RoadmapStep[] }
  if (!Array.isArray(r.steps)) return null
  const sorted = [...r.steps].sort((a, b) => a.order - b.order)
  return sorted.find((s) => !s.completed) ?? null
}

export async function GoalWidget() {
  const session = await auth()
  if (!session?.user?.id) return null

  const goals = await prisma.improvementGoal.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
    select: {
      id: true,
      title: true,
      progressPercent: true,
      roadmap: true,
    },
  })

  if (goals.length === 0) {
    return (
      <GlassCard intensity="primary" padding="lg" className="text-center">
        <div className="glass-ultralight border-glass rounded-2xl p-3 w-fit mx-auto mb-3">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Define tu primer objetivo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Crea un objetivo de mejora y la IA generara un plan personalizado para ti
        </p>
        <GlassButton variant="solid" asChild>
          <Link href="/goals/create">
            Crear Objetivo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </GlassButton>
      </GlassCard>
    )
  }

  return (
    <GlassCard intensity="light" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Mis Objetivos
        </h2>
        <GlassButton variant="ghost" size="sm" asChild>
          <Link href="/goals">
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </GlassButton>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = goal.progressPercent ?? 0
          const nextStep = getNextStep(goal.roadmap)

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="block rounded-xl glass-ultralight border-glass p-3 hover:glass-light transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm line-clamp-1">{goal.title}</h3>
                <span className="text-xs font-medium text-primary ml-2 shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>

              {/* Next step hint */}
              {nextStep && (
                <p className="text-xs text-muted-foreground">
                  Siguiente: {nextStep.title}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </GlassCard>
  )
}
