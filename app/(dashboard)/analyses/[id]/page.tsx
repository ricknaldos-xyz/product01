import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { technique: { include: { sport: true } } },
  })

  if (!analysis) {
    return { title: 'Analisis no encontrado | SportTek' }
  }

  return {
    title: `${analysis.technique.name} - ${analysis.technique.sport.name} | SportTek`,
    description: `Resultados del analisis de ${analysis.technique.name} en ${analysis.technique.sport.name}. Revisa tu puntuacion y recomendaciones.`,
  }
}
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Target,
  Dumbbell,
  Loader2,
  Share2,
  Video,
  Swords,
  Users,
  FileDown,
  GitCompareArrows,
} from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { RetryAnalysisButton } from '@/components/analysis/RetryAnalysisButton'
import { ScoreContext } from '@/components/analysis/ScoreContext'
import { SeverityExplainer } from '@/components/analysis/SeverityExplainer'
import { CoachCTA } from '@/components/coach/CoachCTA'
import { ScoreRing } from '@/components/analysis/ScoreRing'
import { CategoryBreakdown } from '@/components/analysis/CategoryBreakdown'
import { IssueAccordion } from '@/components/analysis/IssueAccordion'
import { ShareButton } from '@/components/analysis/ShareButton'
import { MediaPreview } from '@/components/analysis/MediaPreview'
import { ProcessingPoller } from '@/components/analysis/ProcessingPoller'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { ShopRecommendations } from '@/components/analysis/ShopRecommendations'

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
      previousAnalysis: {
        select: { overallScore: true },
      },
    },
  })
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

  // Compute global average score for this technique across all users
  const avgResult = await prisma.analysis.aggregate({
    where: {
      techniqueId: analysis.technique.id,
      status: 'COMPLETED',
      overallScore: { not: null },
    },
    _avg: { overallScore: true },
  })
  const globalAverage = avgResult._avg.overallScore ?? undefined

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Link href="/analyses" className="hover:text-foreground transition-colors">Mis Analisis</Link>
        <span>/</span>
        <span>{analysis.technique.sport.name}</span>
        <span>/</span>
        <span className="text-foreground">{analysis.technique.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/analyses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {analysis.technique.name}
            {analysis.variant && ` - ${analysis.variant.name}`}
          </h1>
          <p className="text-muted-foreground">
            {analysis.technique.sport.name} • {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {analysis.status === 'COMPLETED' && (
            <>
              <GlassButton variant="ghost" size="icon" asChild title="Ver informe">
                <a href={`/api/analyze/${analysis.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <FileDown className="h-5 w-5" />
                </a>
              </GlassButton>
              <GlassButton variant="ghost" size="icon" asChild title="Comparar con otro analisis">
                <Link href={`/analyses/compare?a=${analysis.id}`}>
                  <GitCompareArrows className="h-5 w-5" />
                </Link>
              </GlassButton>
            </>
          )}
          <ShareButton techniqueName={analysis.technique.name} score={analysis.overallScore} />
          {analysis.overallScore && <ScoreRing score={analysis.overallScore} size="sm" />}
        </div>
      </div>

      {/* Status Banner */}
      {analysis.status === 'PROCESSING' && (
        <>
          <ProcessingPoller analysisId={analysis.id} />
          <GlassCard intensity="light" padding="md" className="bg-warning/5 border-warning/20 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-warning" />
            <p className="text-warning">
              Tu analisis esta siendo procesado. Esto puede tomar unos segundos.
            </p>
          </GlassCard>
        </>
      )}

      {analysis.status === 'FAILED' && (
        <GlassCard intensity="light" padding="md" className="bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-destructive font-medium">Error al procesar</p>
              <p className="text-destructive/80 text-sm mb-3">{analysis.errorMessage}</p>
              <RetryAnalysisButton
                analysisId={analysis.id}
                retryCount={analysis.retryCount}
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Media Preview */}
      <MediaPreview items={analysis.mediaItems} />

      {analysis.status === 'COMPLETED' && (
        <>
          {/* Score Context */}
          {analysis.overallScore && (
            <ScoreContext
              score={analysis.overallScore}
              previousScore={analysis.previousAnalysis?.overallScore ?? undefined}
              averageScore={globalAverage}
            />
          )}

          {/* Summary */}
          {analysis.summary && (
            <GlassCard intensity="light" padding="lg">
              <h2 className="font-semibold mb-3">Resumen del analisis</h2>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </GlassCard>
          )}

          {/* Strengths & Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.strengths.length > 0 && (
              <GlassCard intensity="light" padding="lg" className="bg-success/5 border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-success/20 rounded-lg p-1.5">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <h2 className="font-semibold text-success">Fortalezas</h2>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-success/90 text-sm">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {analysis.priorityFocus && (
              <GlassCard intensity="primary" padding="lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="glass-light border-glass rounded-lg p-1.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-semibold">Enfoque Prioritario</h2>
                </div>
                <p className="text-muted-foreground">{analysis.priorityFocus}</p>
              </GlassCard>
            )}
          </div>

          {/* Category Breakdown */}
          <CategoryBreakdown issues={analysis.issues} />

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Problemas Detectados ({analysis.issues.length})
                </h2>
                <SeverityExplainer />
              </div>
              <IssueAccordion issues={analysis.issues} />
            </div>
          )}

          {/* Coach CTA */}
          <CoachCTA context="analysis" />

          {/* Training Plan CTA */}
          <GlassCard intensity="primary" padding="xl" className="text-center">
            {analysis.trainingPlan ? (
              <>
                <h3 className="font-semibold mb-2">Plan de Entrenamiento</h3>
                <p className="text-muted-foreground mb-4">
                  Ya tienes un plan generado para este analisis
                </p>
                <GlassButton variant="solid" asChild>
                  <Link href={`/training/${analysis.trainingPlan.id}`}>
                    Ver Plan de Entrenamiento
                  </Link>
                </GlassButton>
              </>
            ) : (
              <>
                <div className="glass-light border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
                  <Dumbbell className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  Genera tu Plan de Entrenamiento
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {analysis.issues.length > 0
                    ? `Basado en los ${analysis.issues.length} problemas detectados, podemos crear un plan personalizado de ejercicios para mejorar tu tecnica`
                    : 'Basado en tu analisis, podemos crear un plan personalizado de ejercicios para mejorar tu tecnica'}
                </p>
                <GlassButton variant="solid" asChild>
                  <Link href={`/training/generate?analysisId=${analysis.id}`}>
                    Generar Plan
                  </Link>
                </GlassButton>
              </>
            )}
          </GlassCard>

          {/* Contextual Shop Recommendations */}
          <ShopRecommendations
            sportName={analysis.technique.sport.name}
            techniqueName={analysis.technique.name}
            issues={analysis.issues.map((i) => ({ category: i.category, severity: i.severity }))}
            score={analysis.overallScore}
          />

          {/* Post-Analysis Next Steps */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Siguiente paso</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <GlassCard intensity="ultralight" padding="md" hover="lift" asChild>
                <Link href="/analyze">
                  <div className="flex items-center gap-3">
                    <div className="glass-light border-glass rounded-xl p-2">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Analizar otra tecnica</p>
                      <p className="text-xs text-muted-foreground">Sigue mejorando</p>
                    </div>
                  </div>
                </Link>
              </GlassCard>
              <GlassCard intensity="ultralight" padding="md" hover="lift" asChild>
                <Link href="/matchmaking">
                  <div className="flex items-center gap-3">
                    <div className="glass-light border-glass rounded-xl p-2">
                      <Swords className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Buscar rival</p>
                      <p className="text-xs text-muted-foreground">Pon a prueba tu nivel</p>
                    </div>
                  </div>
                </Link>
              </GlassCard>
              <GlassCard intensity="ultralight" padding="md" hover="lift" asChild>
                <Link href="/rankings">
                  <div className="flex items-center gap-3">
                    <div className="glass-light border-glass rounded-xl p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Ver tu ranking</p>
                      <p className="text-xs text-muted-foreground">Revisa tu posicion</p>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            </div>
          </div>
        </>
      )}

      <ScrollToTop />
    </div>
  )
}
