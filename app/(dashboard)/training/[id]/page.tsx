import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const plan = await prisma.trainingPlan.findUnique({
    where: { id },
    select: { title: true },
  })

  return {
    title: plan ? `${plan.title} | SportTech` : 'Plan de Entrenamiento | SportTech',
    description: 'Detalle de tu plan de entrenamiento con ejercicios y seguimiento de progreso.',
  }
}
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Clock,
  CheckCircle,
  Video,
  Trophy,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ExerciseItem } from './exercise-item'
import { CoachCTA } from '@/components/coach/CoachCTA'

async function getTrainingPlan(id: string, userId: string) {
  return prisma.trainingPlan.findFirst({
    where: { id, userId },
    include: {
      analysis: {
        include: {
          technique: {
            include: { sport: true },
          },
        },
      },
      exercises: {
        include: {
          targetIssues: {
            include: { issue: true },
          },
          progressLogs: {
            where: { userId },
          },
        },
        orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }],
      },
    },
  })
}

export default async function TrainingPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const plan = await getTrainingPlan(id, session.user.id)

  if (!plan) notFound()

  // Group exercises by day
  const exercisesByDay = plan.exercises.reduce((acc, exercise) => {
    const day = exercise.dayNumber
    if (!acc[day]) acc[day] = []
    acc[day].push(exercise)
    return acc
  }, {} as Record<number, typeof plan.exercises>)

  const totalExercises = plan.exercises.length
  const completedExercises = plan.exercises.filter(
    (e) => e.progressLogs.length > 0
  ).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/training">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <p className="text-muted-foreground">
            {plan.analysis.technique.name} • Creado el {formatDate(plan.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard intensity="light" padding="md">
          <div className="glass-ultralight border-glass rounded-lg p-1.5 w-fit mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{plan.durationDays}</div>
          <div className="text-sm text-muted-foreground">Dias</div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="glass-ultralight border-glass rounded-lg p-1.5 w-fit mb-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalExercises}</div>
          <div className="text-sm text-muted-foreground">Ejercicios</div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="bg-success/20 border border-success/30 rounded-lg p-1.5 w-fit mb-2">
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold">{completedExercises}</div>
          <div className="text-sm text-muted-foreground">Completados</div>
        </GlassCard>
        <GlassCard intensity="light" padding="md">
          <div className="glass-ultralight border-glass rounded-lg p-1.5 w-fit mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {Math.round((completedExercises / totalExercises) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Progreso</div>
        </GlassCard>
      </div>

      {/* Progress Bar */}
      <GlassCard intensity="light" padding="md">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progreso General</span>
          <span className="text-muted-foreground">
            {completedExercises} de {totalExercises} ejercicios
          </span>
        </div>
        <div className="h-3 glass-ultralight border-glass rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${(completedExercises / totalExercises) * 100}%`,
            }}
          />
        </div>
      </GlassCard>

      {/* Description */}
      {plan.description && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-2">Descripcion del Plan</h2>
          <p className="text-muted-foreground">{plan.description}</p>
        </GlassCard>
      )}

      {/* Exercises by Day */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Ejercicios por Dia</h2>

        {Object.entries(exercisesByDay).map(([day, exercises]) => (
          <GlassCard
            key={day}
            intensity="light"
            padding="none"
            className="overflow-hidden"
          >
            <div className="glass-primary px-5 py-3 border-b border-glass">
              <h3 className="font-semibold">Dia {day}</h3>
            </div>
            <div className="divide-y divide-glass-border-light">
              {exercises.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  trainingPlanId={plan.id}
                />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Completion CTA - Re-record */}
      {completedExercises === totalExercises && totalExercises > 0 && (
        <GlassCard intensity="medium" padding="lg" className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-success/20 border border-success/30 rounded-full p-3">
              <Trophy className="h-8 w-8 text-success" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Has completado tu plan!</h2>
            <p className="text-muted-foreground mt-1">
              Es momento de medir tu progreso. Grabate ejecutando la misma tecnica para comparar tus resultados.
            </p>
          </div>
          <GlassButton variant="solid" size="lg" asChild>
            <Link href={`/player/analyze`}>
              <Video className="mr-2 h-4 w-4" />
              Grabar nuevo video para comparar
            </Link>
          </GlassButton>
        </GlassCard>
      )}

      {/* Coach CTA */}
      <CoachCTA context="training" />

      {/* Link to Analysis */}
      <GlassCard intensity="ultralight" padding="lg" className="text-center">
        <p className="text-muted-foreground mb-3">
          Este plan fue generado basado en tu analisis de tecnica
        </p>
        <GlassButton variant="outline" asChild>
          <Link href={`/analyses/${plan.analysisId}`}>Ver Analisis Original</Link>
        </GlassButton>
      </GlassCard>
    </div>
  )
}
