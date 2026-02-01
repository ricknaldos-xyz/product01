'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { ScoreInput } from '@/components/matches/ScoreInput'
import { RatingForm } from '@/components/matches/RatingForm'
import { Trophy, Calendar, MapPin, Loader2, ArrowLeft, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
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
  player1Id: string
  player2Id: string
  player1: MatchPlayer
  player2: MatchPlayer
  player1Result: string | null
  player2Result: string | null
  score: string | null
  sets: { p1: number; p2: number }[] | null
  player1EloChange: number | null
  player2EloChange: number | null
  player1Confirmed: boolean
  player2Confirmed: boolean
  player1Rated: boolean
  player2Rated: boolean
  venue: string | null
  playedAt: string | null
  createdAt: string
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [rating, setRating] = useState(false)
  const [sets, setSets] = useState<{ p1: number; p2: number }[]>([{ p1: 0, p2: 0 }])
  const [selectedResult, setSelectedResult] = useState<'WIN' | 'LOSS' | 'NO_SHOW'>('WIN')

  useEffect(() => {
    fetchMatch()
  }, [id])

  async function fetchMatch() {
    try {
      const res = await fetch('/api/matches')
      if (res.ok) {
        const data: Match[] = await res.json()
        const found = data.find((m) => m.id === id)
        if (found) {
          setMatch(found)
          if (found.sets && found.sets.length > 0) {
            setSets(found.sets)
          }
        }
      }
    } catch {
      logger.error('Failed to fetch match')
    } finally {
      setLoading(false)
    }
  }

  async function confirmMatch() {
    if (!match) return
    setConfirming(true)
    try {
      const scoreString = sets.map((s) => `${s.p1}-${s.p2}`).join(', ')
      const res = await fetch(`/api/matches/${match.id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: selectedResult,
          score: scoreString,
          sets,
        }),
      })

      if (res.ok) {
        toast.success('Resultado confirmado')
        fetchMatch()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al confirmar')
      }
    } catch {
      toast.error('Error al confirmar resultado')
    } finally {
      setConfirming(false)
    }
  }

  async function rateOpponent(ratingData: {
    sportsmanship: number
    punctuality: number
    skillAccuracy: number
    comment: string
  }) {
    if (!match) return
    setRating(true)
    try {
      const res = await fetch(`/api/matches/${match.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData),
      })

      if (res.ok) {
        toast.success('Calificacion enviada')
        fetchMatch()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al calificar')
      }
    } catch {
      toast.error('Error al enviar calificacion')
    } finally {
      setRating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Partido no encontrado</p>
          </div>
        </GlassCard>
      </div>
    )
  }

  const currentUserId = session?.user?.id
  const isPlayer1 = match.player1.userId === currentUserId
  const isPlayer2 = match.player2.userId === currentUserId
  const currentPlayerConfirmed = isPlayer1 ? match.player1Confirmed : match.player2Confirmed
  const currentPlayerRated = isPlayer1 ? match.player1Rated : match.player2Rated
  const bothConfirmed = match.player1Confirmed && match.player2Confirmed

  const p1Name = match.player1.displayName || match.player1.user.name || 'Jugador 1'
  const p2Name = match.player2.displayName || match.player2.user.name || 'Jugador 2'
  const opponentName = isPlayer1 ? p2Name : p1Name

  function renderPlayerSide(player: MatchPlayer, eloChange: number | null, confirmed: boolean, side: 'left' | 'right') {
    const name = player.displayName || player.user.name || 'Jugador'
    const avatar = player.avatarUrl || player.user.image
    const isLeft = side === 'left'

    return (
      <div className={`flex-1 flex flex-col items-center gap-2 text-center`}>
        <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <Image src={avatar} alt="" fill className="object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <TierBadge tier={player.skillTier} size="sm" />
          {eloChange !== null && (
            <p
              className={`text-sm font-medium mt-1 inline-flex items-center gap-0.5 ${
                eloChange > 0 ? 'text-green-600' : 'text-red-500'
              }`}
              aria-label={eloChange > 0 ? `Ganaste ${eloChange} puntos ELO` : `Perdiste ${Math.abs(eloChange)} puntos ELO`}
            >
              {eloChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {eloChange > 0 ? '+' : ''}{eloChange} ELO
            </p>
          )}
          <div className="flex items-center justify-center gap-1 mt-1">
            {confirmed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-500" />
            )}
            <span className={`text-xs ${confirmed ? 'text-green-600' : 'text-yellow-600'}`}>
              {confirmed ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/matches">
          <GlassButton variant="ghost" size="sm" aria-label="Volver a partidos">
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
        </Link>
        <Trophy className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Detalle del Partido</h1>
      </div>

      {/* Players & Score */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-start justify-center gap-6">
          {renderPlayerSide(match.player1, match.player1EloChange, match.player1Confirmed, 'left')}

          <div className="flex flex-col items-center justify-center pt-4">
            <p className="text-2xl font-bold tabular-nums">
              {match.score || 'vs'}
            </p>
            {match.playedAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <Calendar className="h-3 w-3" />
                {new Date(match.playedAt).toLocaleDateString('es-PE', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
            {match.venue && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {match.venue}
              </p>
            )}
          </div>

          {renderPlayerSide(match.player2, match.player2EloChange, match.player2Confirmed, 'right')}
        </div>
      </GlassCard>

      {/* Confirm score (if current user hasn't confirmed yet) */}
      {(isPlayer1 || isPlayer2) && !currentPlayerConfirmed && (
        <GlassCard intensity="light" padding="lg">
          <h3 className="font-semibold mb-4">Confirmar resultado</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Resultado</label>
              <div className="flex gap-2">
                {(['WIN', 'LOSS', 'NO_SHOW'] as const).map((result) => (
                  <GlassButton
                    key={result}
                    variant={selectedResult === result ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedResult(result)}
                  >
                    {result === 'WIN' ? 'Victoria' : result === 'LOSS' ? 'Derrota' : 'No show'}
                  </GlassButton>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Marcador</label>
              <div role="group" aria-label="Marcador por sets">
                <ScoreInput value={sets} onChange={setSets} />
              </div>
            </div>

            <GlassButton
              variant="solid"
              onClick={confirmMatch}
              disabled={confirming}
              className="w-full"
            >
              {confirming ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar resultado
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Rate opponent (if both confirmed but current user hasn't rated) */}
      {(isPlayer1 || isPlayer2) && bothConfirmed && !currentPlayerRated && (
        <RatingForm
          opponentName={opponentName}
          onSubmit={rateOpponent}
          loading={rating}
        />
      )}

      {/* Status messages */}
      {(isPlayer1 || isPlayer2) && currentPlayerConfirmed && !bothConfirmed && (
        <GlassCard intensity="light" padding="md">
          <p className="text-sm text-center text-yellow-600 inline-flex items-center gap-1.5 w-full justify-center">
            <Clock className="h-4 w-4 flex-shrink-0" />
            Has confirmado tu resultado. Esperando confirmacion de {opponentName}.
          </p>
        </GlassCard>
      )}

      {(isPlayer1 || isPlayer2) && bothConfirmed && currentPlayerRated && (
        <GlassCard intensity="light" padding="md">
          <p className="text-sm text-center text-green-600 inline-flex items-center gap-1.5 w-full justify-center">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Partido completado y calificado. Gracias por participar.
          </p>
        </GlassCard>
      )}
    </div>
  )
}
