'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Swords, MapPin, Loader2, Send, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSport } from '@/contexts/SportContext'
import type { SkillTier } from '@prisma/client'

interface DiscoveredPlayer {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  region: string | null
  city: string | null
  skillTier: SkillTier
  compositeScore: number | null
  matchesPlayed: number
  matchElo: number
  playStyle: string | null
  distance: number | null
}

export default function MatchmakingPage() {
  const [players, setPlayers] = useState<DiscoveredPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sendingChallenge, setSendingChallenge] = useState<string | null>(null)
  const { latitude, longitude, requestLocation } = useGeolocation()
  const { activeSport } = useSport()

  useEffect(() => {
    fetchPlayers()
  }, [latitude, longitude, activeSport?.slug])

  async function fetchPlayers() {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams()
      if (latitude && longitude) {
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
      }
      params.set('sport', activeSport?.slug || 'tennis')

      const res = await fetch(`/api/matchmaking/discover?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPlayers(data)
    } catch {
      setError(true)
      toast.error('Error al cargar jugadores')
    } finally {
      setLoading(false)
    }
  }

  async function sendChallenge(userId: string) {
    setSendingChallenge(userId)
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengedUserId: userId, sportSlug: activeSport?.slug || 'tennis' }),
      })

      if (res.ok) {
        toast.success('Desafio enviado!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al enviar desafio')
      }
    } catch {
      toast.error('Error al enviar desafio')
    } finally {
      setSendingChallenge(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Encontrar Rivales</h1>
        </div>
        <GlassButton variant="outline" size="sm" onClick={requestLocation} aria-label={latitude ? 'GPS activo' : 'Activar GPS'}>
          <MapPin className="h-4 w-4 mr-2" />
          {latitude ? 'GPS activo' : 'Activar GPS'}
        </GlassButton>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-16">
          <GlassCard intensity="medium" padding="xl" className="max-w-md text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
            <h2 className="text-xl font-bold mb-2">Error al cargar</h2>
            <p className="text-muted-foreground mb-6">No se pudo cargar la informacion.</p>
            <GlassButton variant="solid" onClick={() => fetchPlayers()}>
              Intentar de nuevo
            </GlassButton>
          </GlassCard>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : players.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No se encontraron jugadores</p>
            <p className="text-sm mt-1">Intenta activar GPS o ampliar tu busqueda</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <GlassCard key={player.userId} intensity="light" padding="md" hover="lift">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {player.avatarUrl ? (
                    <Image src={player.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {(player.displayName || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{player.displayName || 'Jugador'}</p>
                    <TierBadge tier={player.skillTier} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {player.distance !== null && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {player.distance} km
                      </span>
                    )}
                    {player.playStyle && (
                      <span className="text-xs text-muted-foreground">{player.playStyle}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ELO {player.matchElo} | {player.matchesPlayed} partidos
                    </span>
                  </div>
                </div>

                {/* Score + Challenge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold tabular-nums text-lg">
                      {player.compositeScore?.toFixed(1) || '--'}
                    </p>
                  </div>
                  <GlassButton
                    variant="solid"
                    size="sm"
                    onClick={() => sendChallenge(player.userId)}
                    disabled={sendingChallenge === player.userId}
                    aria-label={`Enviar desafio a ${player.displayName || 'jugador'}`}
                  >
                    {sendingChallenge === player.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
