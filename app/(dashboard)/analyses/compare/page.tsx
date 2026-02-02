import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { ScoreRing } from '@/components/analysis/ScoreRing'
import { formatDate } from '@/lib/date-utils'
import { CompareSelector } from '@/components/analysis/CompareSelector'

export const metadata: Metadata = {
  title: 'Comparar Analisis | SportTek',
  description: 'Compara dos analisis lado a lado para ver tu progreso.',
}

async function getAnalysis(id: string, userId: string) {
  return prisma.analysis.findFirst({
    where: { id, userId, status: 'COMPLETED' },
    include: {
      technique: { include: { sport: true } },
      variant: true,
      issues: { orderBy: { severity: 'desc' } },
    },
  })
}

async function getUserAnalyses(userId: string, techniqueId?: string) {
  return prisma.analysis.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      ...(techniqueId ? { techniqueId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      overallScore: true,
      createdAt: true,
      technique: { select: { name: true, sport: { select: { name: true } } } },
      variant: { select: { name: true } },
    },
  })
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-muted-foreground text-sm flex items-center gap-1"><Minus className="h-3 w-3" /> Sin cambio</span>
  const positive = delta > 0
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${positive ? 'text-success' : 'text-destructive'}`}>
      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {positive ? '+' : ''}{delta.toFixed(1)}
    </span>
  )
}

function CategoryBar({ label, scoreA, scoreB }: { label: string; scoreA: number; scoreB: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{scoreA.toFixed(1)} vs {scoreB.toFixed(1)}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${scoreA * 10}%` }} />
        </div>
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${scoreB * 10}%` }} />
        </div>
      </div>
    </div>
  )
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { a: idA, b: idB } = await searchParams

  if (!idA) redirect('/analyses')

  const analysisA = await getAnalysis(idA, session.user.id)
  if (!analysisA) notFound()

  // If no B selected, show selector
  if (!idB) {
    const candidates = await getUserAnalyses(session.user.id, analysisA.techniqueId)
    const serialized = candidates
      .filter((c) => c.id !== idA)
      .map((c) => ({
        id: c.id,
        overallScore: c.overallScore,
        createdAt: c.createdAt.toISOString(),
        technique: c.technique,
        variant: c.variant,
      }))

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" size="icon" asChild>
            <Link href={`/analyses/${idA}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </GlassButton>
          <div>
            <h1 className="text-2xl font-bold">Comparar Analisis</h1>
            <p className="text-muted-foreground">
              Selecciona el segundo analisis de {analysisA.technique.name} para comparar
            </p>
          </div>
        </div>

        <CompareSelector
          analysisAId={idA}
          candidates={serialized}
        />
      </div>
    )
  }

  const analysisB = await getAnalysis(idB, session.user.id)
  if (!analysisB) notFound()

  // Ensure chronological order: A is older, B is newer
  const [older, newer] = analysisA.createdAt < analysisB.createdAt
    ? [analysisA, analysisB]
    : [analysisB, analysisA]

  const scoreA = older.overallScore ?? 0
  const scoreB = newer.overallScore ?? 0
  const scoreDelta = scoreB - scoreA

  // Categorize issues
  const olderIssues = new Set(older.issues.map((i) => i.title.toLowerCase()))
  const newerIssues = new Set(newer.issues.map((i) => i.title.toLowerCase()))

  const resolvedIssues = older.issues.filter((i) => !newerIssues.has(i.title.toLowerCase()))
  const persistingIssues = newer.issues.filter((i) => olderIssues.has(i.title.toLowerCase()))
  const newIssues = newer.issues.filter((i) => !olderIssues.has(i.title.toLowerCase()))

  // Category breakdown
  const categories = new Map<string, { a: number; b: number }>()
  for (const issue of older.issues) {
    const existing = categories.get(issue.category) || { a: 0, b: 0 }
    existing.a++
    categories.set(issue.category, existing)
  }
  for (const issue of newer.issues) {
    const existing = categories.get(issue.category) || { a: 0, b: 0 }
    existing.b++
    categories.set(issue.category, existing)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/analyses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Comparar Analisis</h1>
          <p className="text-muted-foreground">
            {older.technique.name} — {older.technique.sport.name}
          </p>
        </div>
      </div>

      {/* Score Comparison */}
      <GlassCard intensity="light" padding="xl">
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Antes</p>
            <p className="text-sm text-muted-foreground mb-3">{formatDate(older.createdAt)}</p>
            {older.overallScore != null && <ScoreRing score={older.overallScore} size="md" />}
          </div>
          <div className="text-center space-y-2">
            <DeltaBadge delta={scoreDelta} />
            <p className="text-xs text-muted-foreground">
              {older.issues.length} → {newer.issues.length} problemas
            </p>
            {resolvedIssues.length > 0 && (
              <GlassBadge variant="success" size="sm">
                {resolvedIssues.length} resuelto{resolvedIssues.length > 1 ? 's' : ''}
              </GlassBadge>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Despues</p>
            <p className="text-sm text-muted-foreground mb-3">{formatDate(newer.createdAt)}</p>
            {newer.overallScore != null && <ScoreRing score={newer.overallScore} size="md" />}
          </div>
        </div>
      </GlassCard>

      {/* Category Breakdown */}
      {categories.size > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h2 className="font-semibold mb-4">Problemas por Categoria</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-primary/60 inline-block" /> Antes</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-primary inline-block" /> Despues</span>
          </div>
          <div className="space-y-4">
            {Array.from(categories.entries()).map(([cat, counts]) => (
              <CategoryBar key={cat} label={cat} scoreA={counts.a} scoreB={counts.b} />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Issues Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Resolved */}
        <GlassCard intensity="light" padding="lg" className="bg-success/5 border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-success" />
            <h3 className="font-semibold text-success">Resueltos ({resolvedIssues.length})</h3>
          </div>
          {resolvedIssues.length > 0 ? (
            <ul className="space-y-2">
              {resolvedIssues.map((issue) => (
                <li key={issue.id} className="text-sm text-success/80 line-through">
                  {issue.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ningun problema resuelto aun</p>
          )}
        </GlassCard>

        {/* Persisting */}
        <GlassCard intensity="light" padding="lg" className="bg-warning/5 border-warning/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-warning">Persisten ({persistingIssues.length})</h3>
          </div>
          {persistingIssues.length > 0 ? (
            <ul className="space-y-2">
              {persistingIssues.map((issue) => (
                <li key={issue.id} className="text-sm text-muted-foreground">
                  {issue.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ningun problema persistente</p>
          )}
        </GlassCard>

        {/* New */}
        <GlassCard intensity="light" padding="lg" className="bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-destructive">Nuevos ({newIssues.length})</h3>
          </div>
          {newIssues.length > 0 ? (
            <ul className="space-y-2">
              {newIssues.map((issue) => (
                <li key={issue.id} className="text-sm text-muted-foreground">
                  {issue.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ningun problema nuevo</p>
          )}
        </GlassCard>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {older.summary && (
          <GlassCard intensity="ultralight" padding="lg">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Resumen (Antes)</h3>
            <p className="text-sm">{older.summary}</p>
          </GlassCard>
        )}
        {newer.summary && (
          <GlassCard intensity="ultralight" padding="lg">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Resumen (Despues)</h3>
            <p className="text-sm">{newer.summary}</p>
          </GlassCard>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <GlassButton variant="outline" asChild>
          <Link href={`/analyses/${older.id}`}>Ver analisis anterior</Link>
        </GlassButton>
        <GlassButton variant="solid" asChild>
          <Link href={`/analyses/${newer.id}`}>Ver analisis reciente</Link>
        </GlassButton>
      </div>
    </div>
  )
}
