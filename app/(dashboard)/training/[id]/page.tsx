import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ExerciseItem } from './exercise-item'

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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/training">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <p className="text-muted-foreground">
            {plan.analysis.technique.name} • Creado el {formatDate(plan.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">{plan.durationDays}</div>
          <div className="text-sm text-muted-foreground">Dias</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Dumbbell className="h-5 w-5 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">{totalExercises}</div>
          <div className="text-sm text-muted-foreground">Ejercicios</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
          <div className="text-2xl font-bold">{completedExercises}</div>
          <div className="text-sm text-muted-foreground">Completados</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <Clock className="h-5 w-5 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">
            {Math.round((completedExercises / totalExercises) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Progreso</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progreso General</span>
          <span className="text-muted-foreground">
            {completedExercises} de {totalExercises} ejercicios
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${(completedExercises / totalExercises) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-2">Descripcion del Plan</h2>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
      )}

      {/* Exercises by Day */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Ejercicios por Dia</h2>

        {Object.entries(exercisesByDay).map(([day, exercises]) => (
          <div
            key={day}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="bg-muted/50 px-5 py-3 border-b border-border">
              <h3 className="font-semibold">Dia {day}</h3>
            </div>
            <div className="divide-y divide-border">
              {exercises.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  trainingPlanId={plan.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Link to Analysis */}
      <div className="bg-muted/50 rounded-xl p-5 text-center">
        <p className="text-muted-foreground mb-3">
          Este plan fue generado basado en tu analisis de tecnica
        </p>
        <Button variant="outline" asChild>
          <Link href={`/analyses/${plan.analysisId}`}>Ver Analisis Original</Link>
        </Button>
      </div>
    </div>
  )
}
