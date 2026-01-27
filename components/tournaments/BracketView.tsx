'use client'

import { GlassCard } from '@/components/ui/glass-card'

interface BracketMatch {
  id: string
  round: number
  position: number
  player1Id: string | null
  player2Id: string | null
  winnerId: string | null
  match?: { score: string | null }
  player1Name?: string
  player2Name?: string
}

interface BracketViewProps {
  brackets: BracketMatch[]
}

function getRoundLabel(round: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - round
  if (roundsFromEnd === 0) return 'Final'
  if (roundsFromEnd === 1) return 'Semifinal'
  if (roundsFromEnd === 2) return 'Cuartos'
  return `Ronda ${round}`
}

export function BracketView({ brackets }: BracketViewProps) {
  if (brackets.length === 0) return null

  const totalRounds = Math.max(...brackets.map((b) => b.round))
  const rounds: Record<number, BracketMatch[]> = {}

  for (const bracket of brackets) {
    if (!rounds[bracket.round]) rounds[bracket.round] = []
    rounds[bracket.round].push(bracket)
  }

  // Sort matches within each round by position
  for (const round of Object.keys(rounds)) {
    rounds[Number(round)].sort((a, b) => a.position - b.position)
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${totalRounds}, minmax(200px, 1fr))`,
        }}
      >
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="space-y-3">
            <h3 className="text-sm font-semibold text-center text-muted-foreground">
              {getRoundLabel(round, totalRounds)}
            </h3>
            <div
              className="flex flex-col gap-4 justify-around"
              style={{ minHeight: rounds[1] ? `${rounds[1].length * 80}px` : 'auto' }}
            >
              {(rounds[round] || []).map((bracket) => (
                <GlassCard
                  key={bracket.id}
                  intensity="light"
                  padding="sm"
                  className="text-sm"
                >
                  {/* Player 1 */}
                  <div
                    className={`flex items-center justify-between py-1.5 px-2 rounded-t-lg ${
                      bracket.winnerId && bracket.winnerId === bracket.player1Id
                        ? 'font-bold text-primary'
                        : bracket.winnerId && bracket.winnerId !== bracket.player1Id
                          ? 'opacity-50'
                          : ''
                    }`}
                  >
                    <span className="truncate max-w-[140px]">
                      {bracket.player1Name || (bracket.player1Id ? 'Jugador' : 'TBD')}
                    </span>
                    {bracket.match?.score && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {bracket.match.score.split('-')[0] || ''}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-glass" />

                  {/* Player 2 */}
                  <div
                    className={`flex items-center justify-between py-1.5 px-2 rounded-b-lg ${
                      bracket.winnerId && bracket.winnerId === bracket.player2Id
                        ? 'font-bold text-primary'
                        : bracket.winnerId && bracket.winnerId !== bracket.player2Id
                          ? 'opacity-50'
                          : ''
                    }`}
                  >
                    <span className="truncate max-w-[140px]">
                      {bracket.player2Name || (bracket.player2Id ? 'Jugador' : 'TBD')}
                    </span>
                    {bracket.match?.score && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {bracket.match.score.split('-')[1] || ''}
                      </span>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
