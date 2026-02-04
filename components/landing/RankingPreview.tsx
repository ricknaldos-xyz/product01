'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Trophy, Medal, ArrowRight } from 'lucide-react'

interface RankedPlayer {
  rank: number
  displayName: string | null
  skillTier: string
  effectiveScore: number | null
  region: string | null
}

const tierColors: Record<string, string> = {
  PRIMERA_A: 'text-violet-600',
  PRIMERA_B: 'text-violet-500',
  SEGUNDA_A: 'text-cyan-600',
  SEGUNDA_B: 'text-cyan-500',
  TERCERA_A: 'text-emerald-600',
  TERCERA_B: 'text-emerald-500',
  CUARTA_A: 'text-yellow-600',
  CUARTA_B: 'text-yellow-500',
  QUINTA_A: 'text-amber-600',
  QUINTA_B: 'text-amber-500',
}

const tierLabels: Record<string, string> = {
  PRIMERA_A: '1ra A',
  PRIMERA_B: '1ra B',
  SEGUNDA_A: '2da A',
  SEGUNDA_B: '2da B',
  TERCERA_A: '3ra A',
  TERCERA_B: '3ra B',
  CUARTA_A: '4ta A',
  CUARTA_B: '4ta B',
  QUINTA_A: '5ta A',
  QUINTA_B: '5ta B',
}

export function RankingPreview() {
  const [players, setPlayers] = useState<RankedPlayer[]>([])

  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rankings?country=PE&limit=10')
        if (res.ok) {
          const data = await res.json()
          setPlayers(data.rankings)
        }
      } catch {
        // Silently fail for landing page
      }
    }
    fetchRankings()
  }, [])

  return (
    <section id="ranking" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Rankings
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ranking Nacional Perú
          </h2>
          <p className="text-lg text-muted-foreground">
            Los mejores tenistas amateur del país. Tú podrías estar aquí.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <GlassCard intensity="light" padding="none">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Top 10 Perú</span>
            </div>

            {/* Table */}
            {players.length > 0 ? (
              <div className="divide-y divide-border/50">
                {players.map((player) => (
                  <div key={player.rank} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-8 text-center flex-shrink-0">
                      {player.rank <= 3 ? (
                        <Medal className={`h-5 w-5 mx-auto ${
                          player.rank === 1 ? 'text-yellow-500' :
                          player.rank === 2 ? 'text-slate-400' :
                          'text-amber-600'
                        }`} />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">{player.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {player.displayName || 'Jugador'}
                      </p>
                      {player.region && (
                        <p className="text-xs text-muted-foreground">{player.region}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${tierColors[player.skillTier] || ''}`}>
                      {tierLabels[player.skillTier] || ''}
                    </span>
                    <span className="font-bold tabular-nums text-sm w-12 text-right">
                      {player.effectiveScore?.toFixed(1) || '--'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm">Sé el primero en aparecer en el ranking</p>
              </div>
            )}

            {/* CTA */}
            <div className="px-6 py-4 border-t border-border/50">
              <GlassButton variant="default" className="w-full" asChild>
                <Link href="/rankings">
                  Ver ranking completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
