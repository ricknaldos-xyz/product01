import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Mis Objetivos | SportTech',
  description: 'Gestiona tus objetivos de mejora deportiva.',
}

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Target, Plus, XCircle, Trophy } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { GoalCard } from '@/components/goals/GoalCard'
import type { GoalStatus } from '@prisma/client'

const TABS: { value: GoalStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'COMPLETED', label: 'Completados' },
  { value: 'ABANDONED', label: 'Abandonados' },
]

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { status: statusParam } = await searchParams
  const statusFilter: GoalStatus =
    statusParam === 'COMPLETED'
      ? 'COMPLETED'
      : statusParam === 'ABANDONED'
      ? 'ABANDONED'
      : 'ACTIVE'

  const goals = await prisma.improvementGoal.findMany({
    where: { userId: session.user.id, status: statusFilter },
    orderBy: { createdAt: 'desc' },
    include: {
      techniques: { include: { technique: { include: { sport: true } } } },
      _count: { select: { analyses: true, trainingPlans: true } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Mis Objetivos</h1>
        </div>
        <GlassButton variant="solid" asChild>
          <Link href="/goals/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Objetivo
          </Link>
        </GlassButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <GlassButton
            key={tab.value}
            variant={statusFilter === tab.value ? 'solid' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={`/goals?status=${tab.value}`}>{tab.label}</Link>
          </GlassButton>
        ))}
      </div>

      {/* Goals list */}
      {goals.length > 0 ? (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <GlassCard intensity="light" padding="xl" className="text-center">
          <div className="glass-ultralight border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
            {statusFilter === 'ACTIVE' ? (
              <Target className="h-12 w-12 text-muted-foreground" />
            ) : statusFilter === 'COMPLETED' ? (
              <Trophy className="h-12 w-12 text-muted-foreground" />
            ) : (
              <XCircle className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">
            {statusFilter === 'ACTIVE'
              ? 'No tienes objetivos activos'
              : statusFilter === 'COMPLETED'
              ? 'Aun no has completado ningun objetivo'
              : 'No tienes objetivos abandonados'}
          </h3>
          {statusFilter === 'ACTIVE' && (
            <>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crea tu primer objetivo para comenzar a mejorar tu tecnica deportiva con un plan personalizado
              </p>
              <GlassButton variant="solid" size="lg" asChild>
                <Link href="/goals/create">Crear primer objetivo</Link>
              </GlassButton>
            </>
          )}
        </GlassCard>
      )}
    </div>
  )
}
