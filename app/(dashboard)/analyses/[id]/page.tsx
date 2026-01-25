import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Target,
  Dumbbell,
  Play,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

async function getAnalysis(id: string, userId: string) {
  return prisma.analysis.findFirst({
    where: { id, userId },
    include: {
      technique: {
        include: { sport: true },
      },
      variant: true,
      mediaItems: true,
      issues: {
        orderBy: { severity: 'desc' },
      },
      trainingPlan: true,
    },
  })
}

const severityColors = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
}

const severityLabels = {
  CRITICAL: 'Critico',
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const analysis = await getAnalysis(id, session.user.id)

  if (!analysis) notFound()

  const scoreColor =
    analysis.overallScore && analysis.overallScore >= 8
      ? 'text-green-600'
      : analysis.overallScore && analysis.overallScore >= 6
      ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/analyses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {analysis.technique.name}
            {analysis.variant && ` - ${analysis.variant.name}`}
          </h1>
          <p className="text-muted-foreground">
            {analysis.technique.sport.name} • {formatDate(analysis.createdAt)}
          </p>
        </div>
        {analysis.overallScore && (
          <div className="text-center">
            <div className={cn('text-4xl font-bold', scoreColor)}>
              {analysis.overallScore.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Puntuacion</div>
          </div>
        )}
      </div>

      {/* Status Banner */}
      {analysis.status === 'PROCESSING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-yellow-700">
            Tu analisis esta siendo procesado. Esto puede tomar unos segundos.
          </p>
        </div>
      )}

      {analysis.status === 'FAILED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-700 font-medium">Error al procesar</p>
            <p className="text-red-600 text-sm">{analysis.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Media Preview */}
      {analysis.mediaItems.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Archivos analizados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analysis.mediaItems.map((item) => (
              <div
                key={item.id}
                className="aspect-video bg-muted rounded-lg overflow-hidden relative"
              >
                {item.type === 'VIDEO' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.angle && (
                  <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                    {item.angle}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.status === 'COMPLETED' && (
        <>
          {/* Summary */}
          {analysis.summary && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Resumen del analisis</h2>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>
          )}

          {/* Strengths & Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="font-semibold text-green-900">Fortalezas</h2>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-green-800 text-sm">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.priorityFocus && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Enfoque Prioritario</h2>
                </div>
                <p className="text-muted-foreground">{analysis.priorityFocus}</p>
              </div>
            )}
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Problemas Detectados ({analysis.issues.length})
              </h2>
              {analysis.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <span className="text-sm text-muted-foreground capitalize">
                        {issue.category}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium border',
                        severityColors[issue.severity]
                      )}
                    >
                      {severityLabels[issue.severity]}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4">{issue.description}</p>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm mb-2">Como corregirlo:</h4>
                    <p className="text-sm text-muted-foreground">
                      {issue.correction}
                    </p>
                  </div>

                  {issue.drills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Ejercicios recomendados:
                      </h4>
                      <ul className="space-y-1">
                        {issue.drills.map((drill, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <Dumbbell className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {drill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Training Plan CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            {analysis.trainingPlan ? (
              <>
                <h3 className="font-semibold mb-2">Plan de Entrenamiento</h3>
                <p className="text-muted-foreground mb-4">
                  Ya tienes un plan generado para este analisis
                </p>
                <Button asChild>
                  <Link href={`/training/${analysis.trainingPlan.id}`}>
                    Ver Plan de Entrenamiento
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Dumbbell className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">
                  Genera tu Plan de Entrenamiento
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Basado en los problemas detectados, podemos crear un plan
                  personalizado de ejercicios para mejorar tu tecnica
                </p>
                <Button asChild>
                  <Link href={`/training/generate?analysisId=${analysis.id}`}>
                    Generar Plan
                  </Link>
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
