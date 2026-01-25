import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Dumbbell, Calendar, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

async function getTrainingPlans(userId: string) {
  return prisma.trainingPlan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      analysis: {
        include: {
          technique: {
            include: { sport: true },
          },
        },
      },
      _count: {
        select: { exercises: true, progressLogs: true },
      },
    },
  })
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ABANDONED: 'bg-gray-100 text-gray-700',
}

const statusLabels = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  ABANDONED: 'Abandonado',
}

export default async function TrainingPage() {
  const session = await auth()
  if (!session?.user) return null

  const plans = await getTrainingPlans(session.user.id)
  const activePlans = plans.filter((p) => p.status === 'ACTIVE')
  const completedPlans = plans.filter((p) => p.status === 'COMPLETED')
  const otherPlans = plans.filter(
    (p) => p.status !== 'ACTIVE' && p.status !== 'COMPLETED'
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Entrenamiento</h1>
        <p className="text-muted-foreground">
          Tus planes de entrenamiento personalizados
        </p>
      </div>

      {/* Active Plans */}
      {activePlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Planes Activos
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activePlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/training/${plan.id}`}
                className="bg-card border-2 border-primary/20 rounded-xl p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.analysis.technique.name} -{' '}
                      {plan.analysis.technique.sport.name}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-md text-xs font-medium',
                      statusColors[plan.status]
                    )}
                  >
                    {statusLabels[plan.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {plan.durationDays} dias
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    {plan._count.exercises} ejercicios
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso</span>
                    <span>
                      {plan._count.progressLogs} / {plan._count.exercises * plan.durationDays}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (plan._count.progressLogs /
                            (plan._count.exercises * plan.durationDays)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Planes Completados
          </h2>
          <div className="grid gap-4">
            {completedPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/training/${plan.id}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.analysis.technique.name} • Completado el{' '}
                    {plan.completedAt ? formatDate(plan.completedAt) : 'N/A'}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Plans */}
      {otherPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Otros Planes</h2>
          <div className="grid gap-4">
            {otherPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/training/${plan.id}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{plan.title}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-medium',
                        statusColors[plan.status]
                      )}
                    >
                      {statusLabels[plan.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.analysis.technique.name}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Dumbbell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            No tienes planes de entrenamiento
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Primero realiza un analisis de tu tecnica, y luego podras generar un
            plan de entrenamiento personalizado
          </p>
          <Button asChild>
            <Link href="/analyze">Crear Analisis</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
