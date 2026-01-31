import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Mis Analisis | SportTek',
  description: 'Historial de todos tus analisis de tecnica deportiva con resultados y puntuaciones.',
}
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Video } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { AnalysesList } from '@/components/analysis/AnalysesList'

async function getAnalyses(userId: string) {
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      technique: {
        include: { sport: true },
      },
      variant: true,
      previousAnalysis: {
        select: { overallScore: true },
      },
      _count: {
        select: { issues: true },
      },
    },
  })
}

export default async function AnalysesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const analyses = await getAnalyses(session.user.id)

  // Serialize dates for client component
  const serialized = analyses.map((a) => ({
    id: a.id,
    status: a.status,
    overallScore: a.overallScore,
    createdAt: a.createdAt.toISOString(),
    technique: {
      name: a.technique.name,
      sport: { slug: a.technique.sport.slug, name: a.technique.sport.name },
    },
    variant: a.variant ? { name: a.variant.name } : null,
    previousAnalysis: a.previousAnalysis ? { overallScore: a.previousAnalysis.overallScore } : null,
    _count: a._count,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Analisis</h1>
          <p className="text-muted-foreground">
            Historial de todos tus analisis de tecnica
          </p>
        </div>
        <GlassButton variant="solid" asChild>
          <Link href="/analyze">
            <Video className="mr-2 h-4 w-4" />
            Nuevo Analisis
          </Link>
        </GlassButton>
      </div>

      <AnalysesList analyses={serialized} />
    </div>
  )
}
