'use client'

import Link from 'next/link'
import { Calendar, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'

interface GoalCardProps {
  goal: {
    id: string
    type: string
    title: string
    status: string
    progressPercent: number | null
    currentScore: number | null
    baselineScore: number | null
    targetScore: number | null
    targetTier: string | null
    createdAt: string | Date
    techniques: { technique: { name: string; sport: { name: string } } }[]
    _count: { analyses: number; trainingPlans: number }
  }
}

const statusConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'default' }> = {
  ACTIVE: { label: 'Activo', variant: 'primary' },
  COMPLETED: { label: 'Completado', variant: 'success' },
  ABANDONED: { label: 'Abandonado', variant: 'default' },
}

function getDaysActive(createdAt: string | Date): number {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = goal.progressPercent ?? 0
  const daysActive = getDaysActive(goal.createdAt)
  const status = statusConfig[goal.status] ?? statusConfig.ACTIVE

  return (
    <GlassCard intensity="light" padding="md" hover="lift" asChild>
      <Link href={`/goals/${goal.id}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-1">{goal.title}</h3>
            <GlassBadge variant={status.variant} size="sm" className="shrink-0">
              {status.label}
            </GlassBadge>
          </div>

          {/* Techniques */}
          {goal.techniques.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {goal.techniques.map((t) => (
                <GlassBadge key={t.technique.name} variant="outline" size="sm">
                  {t.technique.name}
                </GlassBadge>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysActive} {daysActive === 1 ? 'dia' : 'dias'}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {goal._count.analyses} {goal._count.analyses === 1 ? 'analisis' : 'analisis'} · {goal._count.trainingPlans} {goal._count.trainingPlans === 1 ? 'plan' : 'planes'}
            </span>
          </div>
        </div>
      </Link>
    </GlassCard>
  )
}
