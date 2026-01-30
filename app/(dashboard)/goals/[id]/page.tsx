import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  ArrowLeft,
  Target,
  Trophy,
  Calendar,
  BarChart3,
  Dumbbell,
  TrendingUp,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { GoalRoadmap } from '@/components/goals/GoalRoadmap'
import { AbandonGoalButton } from './AbandonGoalButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const goal = await prisma.improvementGoal.findUnique({
    where: { id },
    select: { title: true },
  })
  return {
    title: goal ? `${goal.title} | SportTek` : 'Objetivo | SportTek',
    description: 'Detalle de tu objetivo de mejora con roadmap y progreso.',
  }
}

const statusVariants = {
  ACTIVE: 'success' as const,
  COMPLETED: 'primary' as const,
  ABANDONED: 'default' as const,
}

const statusLabels = {
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  ABANDONED: 'Abandonado',
}

const typeLabels = {
  TECHNIQUE: 'Tecnica',
  SCORE_TARGET: 'Puntaje objetivo',
  TIER_TARGET: 'Nivel objetivo',
}

const tierLabels: Record<string, string> = {
  QUINTA_B: '5ta B',
  QUINTA_A: '5ta A',
  CUARTA_B: '4ta B',
  CUARTA_A: '4ta A',
  TERCERA_B: '3ra B',
  TERCERA_A: '3ra A',
  SEGUNDA_B: '2da B',
  SEGUNDA_A: '2da A',
  PRIMERA_B: '1ra B',
  PRIMERA_A: '1ra A',
}

const planStatusLabels: Record<string, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  ABANDONED: 'Abandonado',
}

const planStatusVariants: Record<string, 'success' | 'warning' | 'primary' | 'default'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'primary',
  ABANDONED: 'default',
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const goal = await prisma.improvementGoal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      techniques: { include: { technique: { include: { sport: true } } } },
      analyses: {
        include: {
          analysis: {
            select: {
              id: true,
              overallScore: true,
              createdAt: true,
              technique: { select: { name: true } },
            },
          },
        },
        orderBy: { analysis: { createdAt: 'asc' } },
      },
      trainingPlans: {
        include: {
          trainingPlan: {
            select: { id: true, title: true, status: true, createdAt: true },
          },
        },
      },
    },
  })

  if (!goal) notFound()

  const daysActive = Math.floor(
    (Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const progressPercent = goal.progressPercent ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/goals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <GlassBadge variant={statusVariants[goal.status]}>
              {statusLabels[goal.status]}
            </GlassBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            {typeLabels[goal.type]} •{' '}
            {goal.techniques.map((t) => t.technique.name).join(', ')} •{' '}
            {goal.techniques[0]?.technique.sport?.name}
          </p>
        </div>

        {/* Circular progress */}
        <div className="text-center glass-primary border-glass rounded-xl px-4 py-2">
          <div className="text-3xl font-bold text-primary">
            {Math.round(progressPercent)}%
          </div>
          <div className="text-xs text-muted-foreground">Progreso</div>
        </div>
      </div>

      {/* Completed celebration */}
      {goal.status === 'COMPLETED' && (
        <GlassCard intensity="primary" padding="lg" className="text-center">
          <div className="glass-light border-glass rounded-2xl p-4 w-fit mx-auto mb-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-1">Objetivo completado</h2>
          <p className="text-muted-foreground">
            Felicitaciones! Has alcanzado tu objetivo
            {goal.completedAt && ` el ${formatDate(goal.completedAt)}`}.
          </p>
        </GlassCard>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <GlassCard intensity="light" padding="md" className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Linea base</div>
          <div className="text-xl font-bold">
            {goal.baselineScore != null ? goal.baselineScore.toFixed(1) : '-'}
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md" className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Puntaje actual</div>
          <div className="text-xl font-bold">
            {goal.currentScore != null ? goal.currentScore.toFixed(1) : '-'}
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md" className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Objetivo</div>
          <div className="text-xl font-bold">
            {goal.type === 'SCORE_TARGET' && goal.targetScore != null
              ? `${goal.targetScore}/10`
              : goal.type === 'TIER_TARGET' && goal.targetTier
              ? tierLabels[goal.targetTier] ?? goal.targetTier
              : 'Mejorar'}
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="md" className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Dias activo</div>
          <div className="text-xl font-bold">{daysActive}</div>
        </GlassCard>
        <GlassCard intensity="light" padding="md" className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Analisis</div>
          <div className="text-xl font-bold">{goal.analyses.length}</div>
        </GlassCard>
      </div>

      {/* Description */}
      {goal.description && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-2">Descripcion</h2>
          <p className="text-muted-foreground">{goal.description}</p>
        </GlassCard>
      )}

      {/* Roadmap */}
      {goal.roadmap && (
        <GoalRoadmap roadmap={goal.roadmap as { steps: { order: number; title: string; description: string; type: 'analysis' | 'training'; completed: boolean; linkedId: string | null }[] }} goalId={goal.id} />
      )}

      {/* Analyses timeline */}
      {goal.analyses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analisis vinculados
          </h2>
          <div className="grid gap-3">
            {goal.analyses.map((ga) => {
              const score = ga.analysis.overallScore
              const delta =
                score != null && goal.baselineScore != null
                  ? score - goal.baselineScore
                  : null
              return (
                <GlassCard
                  key={ga.analysis.id}
                  intensity="light"
                  padding="md"
                  hover="lift"
                  asChild
                >
                  <Link
                    href={`/analyses/${ga.analysis.id}`}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{ga.analysis.technique.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(ga.analysis.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {score != null && (
                        <div className="text-center glass-primary border-glass rounded-xl px-3 py-1">
                          <div className="text-lg font-bold text-primary">
                            {score.toFixed(1)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">/10</div>
                        </div>
                      )}
                      {delta != null && (
                        <GlassBadge
                          variant={delta > 0 ? 'success' : delta < 0 ? 'destructive' : 'default'}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {delta > 0 ? '+' : ''}
                          {delta.toFixed(1)}
                        </GlassBadge>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}

      {/* Training Plans */}
      {goal.trainingPlans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Planes de entrenamiento
          </h2>
          <div className="grid gap-3">
            {goal.trainingPlans.map((gtp) => (
              <GlassCard
                key={gtp.trainingPlan.id}
                intensity="light"
                padding="md"
                hover="lift"
                asChild
              >
                <Link
                  href={`/training/${gtp.trainingPlan.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{gtp.trainingPlan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(gtp.trainingPlan.createdAt)}
                    </p>
                  </div>
                  <GlassBadge variant={planStatusVariants[gtp.trainingPlan.status] ?? 'default'}>
                    {planStatusLabels[gtp.trainingPlan.status] ?? gtp.trainingPlan.status}
                  </GlassBadge>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Abandon button */}
      {goal.status === 'ACTIVE' && (
        <AbandonGoalButton goalId={goal.id} />
      )}
    </div>
  )
}
