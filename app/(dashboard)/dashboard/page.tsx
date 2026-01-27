import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Video, History, Dumbbell, TrendingUp, ArrowRight } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { formatRelativeTime } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { EmailVerificationBanner } from '@/components/banners/EmailVerificationBanner'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { StreakWidget } from '@/components/gamification/StreakWidget'
import { RecentBadgesCard } from '@/components/dashboard/RecentBadgesCard'
import { ActivityHeatmap } from '@/components/gamification/ActivityHeatmap'

async function getStats(userId: string) {
  const [analysesCount, plansCount, completedPlans, recentAnalyses, user] =
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
      prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true, email: true },
      }),
    ])

  return { analysesCount, plansCount, completedPlans, recentAnalyses, user }
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

      {/* Email Verification Banner */}
      {stats.user && !stats.user.emailVerified && (
        <EmailVerificationBanner userEmail={stats.user.email} />
      )}

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        analysisCount={stats.analysesCount}
        trainingPlanCount={stats.plansCount}
      />

      {/* Streak Widget */}
      <StreakWidget />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard
          intensity="primary"
          padding="lg"
          hover="glow"
          className="cursor-pointer"
          asChild
        >
          <Link href="/analyze">
            <div className="glass-light border-glass rounded-xl p-2 w-fit mb-3">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Nuevo Analisis</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Sube un video para analizar tu tecnica
            </p>
          </Link>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="glass-ultralight border-glass rounded-xl p-2 w-fit mb-3">
            <History className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{stats.analysesCount}</h3>
          <p className="text-muted-foreground text-sm">Analisis realizados</p>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="glass-ultralight border-glass rounded-xl p-2 w-fit mb-3">
            <Dumbbell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{stats.plansCount}</h3>
          <p className="text-muted-foreground text-sm">Planes de entrenamiento</p>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="glass-ultralight border-glass rounded-xl p-2 w-fit mb-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{stats.completedPlans}</h3>
          <p className="text-muted-foreground text-sm">Planes completados</p>
        </GlassCard>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Recent Badges */}
      <RecentBadgesCard />

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Analisis recientes</h2>
          <GlassButton variant="ghost" size="sm" asChild>
            <Link href="/analyses">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </GlassButton>
        </div>

        {stats.recentAnalyses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentAnalyses.map((analysis) => (
              <GlassCard
                key={analysis.id}
                intensity="light"
                padding="md"
                hover="lift"
                className="cursor-pointer"
                asChild
              >
                <Link href={`/analyses/${analysis.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{analysis.technique.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.technique.sport.name}
                      </p>
                    </div>
                    {analysis.overallScore && (
                      <GlassBadge variant="primary">
                        {analysis.overallScore.toFixed(1)}/10
                      </GlassBadge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <GlassBadge
                      variant={
                        analysis.status === 'COMPLETED'
                          ? 'success'
                          : analysis.status === 'PROCESSING'
                          ? 'warning'
                          : analysis.status === 'FAILED'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {analysis.status === 'COMPLETED'
                        ? 'Completado'
                        : analysis.status === 'PROCESSING'
                        ? 'Procesando'
                        : analysis.status === 'FAILED'
                        ? 'Error'
                        : 'Pendiente'}
                    </GlassBadge>
                    <span>{formatRelativeTime(analysis.createdAt)}</span>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard intensity="light" padding="xl" className="text-center">
            <div className="glass-ultralight border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No tienes analisis aun</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sube tu primer video para comenzar a mejorar tu tecnica
            </p>
            <GlassButton variant="solid" asChild>
              <Link href="/analyze">Crear primer analisis</Link>
            </GlassButton>
          </GlassCard>
        )}
      </div>

      {/* Sports Available */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deportes disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard
            intensity="light"
            padding="md"
            hover="glow"
            className="flex items-center gap-4 cursor-pointer"
            asChild
          >
            <Link href="/analyze?sport=tennis">
              <div className="w-12 h-12 glass-primary border-glass rounded-xl flex items-center justify-center text-2xl">
                🎾
              </div>
              <div>
                <p className="font-medium">Tenis</p>
                <p className="text-sm text-muted-foreground">4 tecnicas</p>
              </div>
            </Link>
          </GlassCard>

          <GlassCard
            intensity="ultralight"
            padding="md"
            className="flex items-center gap-4 opacity-50"
          >
            <div className="w-12 h-12 glass-ultralight border-glass rounded-xl flex items-center justify-center text-2xl">
              ⛳
            </div>
            <div>
              <p className="font-medium">Golf</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </GlassCard>

          <GlassCard
            intensity="ultralight"
            padding="md"
            className="flex items-center gap-4 opacity-50"
          >
            <div className="w-12 h-12 glass-ultralight border-glass rounded-xl flex items-center justify-center text-2xl">
              🏀
            </div>
            <div>
              <p className="font-medium">Basketball</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </GlassCard>

          <GlassCard
            intensity="ultralight"
            padding="md"
            className="flex items-center gap-4 opacity-50"
          >
            <div className="w-12 h-12 glass-ultralight border-glass rounded-xl flex items-center justify-center text-2xl">
              ⚽
            </div>
            <div>
              <p className="font-medium">Futbol</p>
              <p className="text-sm text-muted-foreground">Proximamente</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
