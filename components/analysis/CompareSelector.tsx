'use client'

import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { ScoreRing } from '@/components/analysis/ScoreRing'
import { formatRelativeTime } from '@/lib/date-utils'
import { GitCompareArrows } from 'lucide-react'

interface Candidate {
  id: string
  overallScore: number | null
  createdAt: string
  technique: { name: string; sport: { name: string } }
  variant: { name: string } | null
}

interface CompareSelectorProps {
  analysisAId: string
  candidates: Candidate[]
}

export function CompareSelector({ analysisAId, candidates }: CompareSelectorProps) {
  const router = useRouter()

  if (candidates.length === 0) {
    return (
      <GlassCard intensity="light" padding="xl" className="text-center">
        <div className="glass-ultralight border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
          <GitCompareArrows className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No hay analisis para comparar</h3>
        <p className="text-muted-foreground">
          Necesitas al menos otro analisis completado de la misma tecnica para poder comparar.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="grid gap-3">
      {candidates.map((c) => (
        <GlassCard
          key={c.id}
          intensity="light"
          padding="lg"
          hover="lift"
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => router.push(`/analyses/compare?a=${analysisAId}&b=${c.id}`)}
        >
          <div className="flex-shrink-0">
            {c.overallScore != null ? (
              <ScoreRing score={c.overallScore} size="sm" />
            ) : (
              <div className="w-[60px] h-[60px] glass-primary border-glass rounded-xl flex items-center justify-center">
                <GitCompareArrows className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {c.technique.name}
              {c.variant && <span className="text-muted-foreground font-normal"> - {c.variant.name}</span>}
            </h3>
            <p className="text-sm text-muted-foreground">
              {c.technique.sport.name} &bull; {formatRelativeTime(new Date(c.createdAt))}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
