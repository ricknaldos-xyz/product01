'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import {
  Users,
  Brain,
  GraduationCap,
  Crown,
  Trophy,
  Swords,
  Flag,
  ShoppingBag,
  Wrench,
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface AnalyticsData {
  totalUsers: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  totalAnalyses: number
  completedAnalyses: number
  analysesThisWeek: number
  totalCoaches: number
  verifiedCoaches: number
  subscriptionBreakdown: { FREE: number; PRO: number; ELITE: number }
  accountTypeBreakdown: { PLAYER: number; COACH: number }
  totalTournaments: number
  totalMatches: number
  totalChallenges: number
  totalShopOrders: number
  totalStringingOrders: number
}

function SkeletonCard() {
  return (
    <GlassCard intensity="light">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
        <div className="h-8 w-16 bg-muted-foreground/20 rounded" />
        <div className="h-3 w-32 bg-muted-foreground/10 rounded" />
      </div>
    </GlassCard>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      logger.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const fmt = (n: number) => n.toLocaleString()

  const subscriptionTotal = data
    ? data.subscriptionBreakdown.FREE +
      data.subscriptionBreakdown.PRO +
      data.subscriptionBreakdown.ELITE
    : 0

  const pct = (n: number) =>
    subscriptionTotal > 0 ? ((n / subscriptionTotal) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analiticas de la Plataforma</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen general de la actividad y crecimiento
        </p>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : data ? (
          <>
            <GlassCard intensity="light">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Total Usuarios
                </span>
              </div>
              <p className="text-3xl font-bold">{fmt(data.totalUsers)}</p>
              <div className="flex items-center gap-2 mt-2">
                <GlassBadge variant="success" size="sm">
                  +{fmt(data.newUsersThisWeek)} esta semana
                </GlassBadge>
              </div>
            </GlassCard>

            <GlassCard intensity="light">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Total Analisis
                </span>
              </div>
              <p className="text-3xl font-bold">{fmt(data.totalAnalyses)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(data.completedAnalyses)} completados &middot;{' '}
                {fmt(data.analysesThisWeek)} esta semana
              </p>
            </GlassCard>

            <GlassCard intensity="light">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Coaches Activos
                </span>
              </div>
              <p className="text-3xl font-bold">{fmt(data.totalCoaches)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(data.verifiedCoaches)} verificados de {fmt(data.totalCoaches)}
              </p>
            </GlassCard>

            <GlassCard intensity="light">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Suscripciones Pro+Elite
                </span>
              </div>
              <p className="text-3xl font-bold">
                {fmt(
                  data.subscriptionBreakdown.PRO +
                    data.subscriptionBreakdown.ELITE
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {fmt(data.subscriptionBreakdown.PRO)} Pro &middot;{' '}
                {fmt(data.subscriptionBreakdown.ELITE)} Elite
              </p>
            </GlassCard>
          </>
        ) : null}
      </div>

      {/* Subscription Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Desglose de Suscripciones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : data ? (
            <>
              {(
                [
                  { tier: 'FREE', label: 'Free', color: 'bg-muted-foreground' },
                  { tier: 'PRO', label: 'Pro', color: 'bg-primary' },
                  { tier: 'ELITE', label: 'Elite', color: 'bg-warning' },
                ] as const
              ).map(({ tier, label, color }) => {
                const count =
                  data.subscriptionBreakdown[tier]
                const percentage = pct(count)
                return (
                  <GlassCard key={tier} intensity="light">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{label}</span>
                      <GlassBadge variant="default" size="sm">
                        {fmt(count)}
                      </GlassBadge>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {percentage}% del total
                    </p>
                  </GlassCard>
                )
              })}
            </>
          ) : null}
        </div>
      </div>

      {/* Activity Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Actividad</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : data ? (
            <>
              <GlassCard intensity="light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Torneos
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {fmt(data.totalTournaments)}
                </p>
              </GlassCard>

              <GlassCard intensity="light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Swords className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Partidos
                  </span>
                </div>
                <p className="text-2xl font-bold">{fmt(data.totalMatches)}</p>
              </GlassCard>

              <GlassCard intensity="light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Flag className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Desafios
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {fmt(data.totalChallenges)}
                </p>
              </GlassCard>
            </>
          ) : null}
        </div>
      </div>

      {/* Commerce Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Comercio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : data ? (
            <>
              <GlassCard intensity="light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Pedidos Tienda
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {fmt(data.totalShopOrders)}
                </p>
              </GlassCard>

              <GlassCard intensity="light">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Pedidos Encordado
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {fmt(data.totalStringingOrders)}
                </p>
              </GlassCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
