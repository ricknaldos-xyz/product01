import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Video, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

async function getAnalyses(userId: string) {
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      technique: {
        include: { sport: true },
      },
      variant: true,
      _count: {
        select: { issues: true },
      },
    },
  })
}

export default async function AnalysesPage() {
  const session = await auth()
  if (!session?.user) return null

  const analyses = await getAnalyses(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Analisis</h1>
          <p className="text-muted-foreground">
            Historial de todos tus analisis de tecnica
          </p>
        </div>
        <Button asChild>
          <Link href="/analyze">
            <Video className="mr-2 h-4 w-4" />
            Nuevo Analisis
          </Link>
        </Button>
      </div>

      {analyses.length > 0 ? (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`/analyses/${analysis.id}`}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {analysis.technique.sport.slug === 'tennis' ? '🎾' : '🏅'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{analysis.technique.name}</h3>
                  {analysis.variant && (
                    <span className="text-sm text-muted-foreground">
                      - {analysis.variant.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.technique.sport.name}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                  {analysis._count.issues > 0 && (
                    <span className="text-muted-foreground">
                      {analysis._count.issues} problema
                      {analysis._count.issues > 1 ? 's' : ''} detectado
                      {analysis._count.issues > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {formatRelativeTime(analysis.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {analysis.overallScore && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {analysis.overallScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">/10</div>
                  </div>
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No tienes analisis aun</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sube tu primer video para que nuestra IA analice tu tecnica y te de
            recomendaciones personalizadas
          </p>
          <Button asChild size="lg">
            <Link href="/analyze">Crear primer analisis</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
