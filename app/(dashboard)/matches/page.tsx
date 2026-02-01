'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { logger } from '@/lib/logger'
import { Loader2, Trophy, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import type { SkillTier } from '@prisma/client'

interface MatchPlayer {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  user: { name: string | null; image: string | null }
}

interface Match {
  id: string
  player1: MatchPlayer
  player2: MatchPlayer
  player1Result: string | null
  player2Result: string | null
  score: string | null
  player1EloChange: number | null
  player2EloChange: number | null
  player1Confirmed: boolean
  player2Confirmed: boolean
  venue: string | null
  playedAt: string | null
  createdAt: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch('/api/matches')
        if (res.ok) {
          const data = await res.json()
          setMatches(data)
        }
      } catch {
        logger.error('Failed to fetch matches')
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Historial de Partidos</h1>
      </div>

      {matches.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Sin partidos</p>
            <p className="text-sm mt-1">Tus partidos apareceran aqui</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const p1Name = match.player1.displayName || match.player1.user.name || 'Jugador 1'
            const p2Name = match.player2.displayName || match.player2.user.name || 'Jugador 2'

            return (
              <GlassCard key={match.id} intensity="light" padding="md">
                <div className="flex items-center gap-4">
                  {/* Player 1 */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TierBadge tier={match.player1.skillTier} size="sm" />
                      <p className="font-semibold truncate">{p1Name}</p>
                    </div>
                    {match.player1EloChange !== null && (
                      <p
                        className={`text-xs font-medium mt-0.5 inline-flex items-center gap-0.5 ${
                          match.player1EloChange > 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                        aria-label={match.player1EloChange > 0 ? `Ganaste ${match.player1EloChange} puntos ELO` : `Perdiste ${Math.abs(match.player1EloChange)} puntos ELO`}
                      >
                        {match.player1EloChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {match.player1EloChange > 0 ? '+' : ''}{match.player1EloChange} ELO
                      </p>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center flex-shrink-0 px-4">
                    <p className="text-lg font-bold tabular-nums">
                      {match.score || 'vs'}
                    </p>
                    {match.playedAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(match.playedAt).toLocaleDateString('es-PE')}
                      </p>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{p2Name}</p>
                      <TierBadge tier={match.player2.skillTier} size="sm" />
                    </div>
                    {match.player2EloChange !== null && (
                      <p
                        className={`text-xs font-medium mt-0.5 inline-flex items-center gap-0.5 ${
                          match.player2EloChange > 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                        aria-label={match.player2EloChange > 0 ? `Ganaste ${match.player2EloChange} puntos ELO` : `Perdiste ${Math.abs(match.player2EloChange)} puntos ELO`}
                      >
                        {match.player2EloChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {match.player2EloChange > 0 ? '+' : ''}{match.player2EloChange} ELO
                      </p>
                    )}
                  </div>
                </div>

                {match.venue && (
                  <p className="text-xs text-muted-foreground text-center mt-2">{match.venue}</p>
                )}

                {(!match.player1Confirmed || !match.player2Confirmed) && (
                  <p className="text-xs text-yellow-600 text-center mt-2">
                    Pendiente de confirmacion
                  </p>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
