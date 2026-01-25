import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Video, History, Dumbbell, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

async function getStats(userId: string) {
  const [analysesCount, plansCount, completedPlans, recentAnalyses] =
    await Promise.all([
      prisma.analysis.count({ where: { userId } }),
      prisma.trainingPlan.count({ where: { userId } }),
      prisma.trainingPlan.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          technique: {
            include: { sport: true },
          },
        },
      }),
    ])

  return { analysesCount, plansCount, completedPlans, recentAnalyses }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const stats = await getStats(session.user.id)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {session.user.name?.split(' ')[0] || 'deportista'}!
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de entrenamiento
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/analyze"
          className="bg-primary text-primary-foreground p-6 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Video className="h-8 w-8 mb-3" />
          <h3 className="font-semibold text-lg">Nuevo Analisis</h3>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Sube un video para analizar tu tecnica
          </p>
        </Link>

        <div className="bg-card border border-border p-6 rounded-xl">
          <History className="h-8 w-8 mb-3 text-muted-foreground" />
          <h3 className="font-semibold text-lg">{stats.analysesCount}</h3>
          <p className="text-muted-foreground text-sm">Analisis realizados</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <Dumbbell className="h-8 w-8 mb-3 text-muted-foreground" />
          <h3 className="font-semibold text-lg">{stats.plansCount}</h3>
          <p className="text-muted-foreground text-sm">Planes de entrenamiento</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <TrendingUp className="h-8 w-8 mb-3 text-muted-foreground" />
          <h3 className="font-semibold text-lg">{stats.completedPlans}</h3>
          <p className="text-muted-foreground text-sm">Planes completados</p>
        </div>
      </div>

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Analisis recientes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/analyses">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {stats.recentAnalyses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentAnalyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/analyses/${analysis.id}`}
                className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{analysis.technique.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.technique.sport.name}
                    </p>
                  </div>
                  {analysis.overallScore && (
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                      {analysis.overallScore.toFixed(1)}/10
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      analysis.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : analysis.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : analysis.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {analysis.status === 'COMPLETED'
                      ? 'Completado'
                      : analysis.status === 'PROCESSING'
                      ? 'Procesando'
                      : analysis.status === 'FAILED'
                      ? 'Error'
                      : 'Pendiente'}
                  </span>
                  <span>{formatRelativeTime(analysis.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No tienes analisis aun</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sube tu primer video para comenzar a mejorar tu tecnica
            </p>
            <Button asChild>
              <Link href="/analyze">Crear primer analisis</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Sports Available */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deportes disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/analyze?sport=tennis"
            className="bg-card border border-border p-4 rounded-xl hover:border-primary/50 transition-colors flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
              🎾
            </div>
            <div>
              <p className="font-medium">Tenis</p>
              <p className="text-sm text-muted-foreground">4 tecnicas</p>
            </div>
          </Link>

          <div className="bg-card border border-border p-4 rounded-xl opacity-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
              ⛳
            </div>
            <div>
              <p className="font-medium">Golf</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl opacity-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
              🏀
            </div>
            <div>
              <p className="font-medium">Basketball</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl opacity-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
              ⚽
            </div>
            <div>
              <p className="font-medium">Futbol</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
