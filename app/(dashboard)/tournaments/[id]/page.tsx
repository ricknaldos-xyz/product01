'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { TierBadge } from '@/components/player/TierBadge'
import { BracketView } from '@/components/tournaments/BracketView'
import { ParticipantList } from '@/components/tournaments/ParticipantList'
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Loader2,
  ArrowLeft,
  Play,
  UserPlus,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'

interface Participant {
  id: string
  profileId: string
  seed: number | null
  eliminated: boolean
  finalPosition: number | null
  profile: {
    displayName: string | null
    avatarUrl: string | null
    skillTier: SkillTier
    effectiveScore: number | null
    user: { name: string | null }
  }
}

interface Bracket {
  id: string
  round: number
  position: number
  player1Id: string | null
  player2Id: string | null
  winnerId: string | null
  match: { score: string | null } | null
}

interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  format: string
  maxPlayers: number
  status: string
  registrationEnd: string
  startDate: string
  endDate: string | null
  venue: string | null
  city: string | null
  minTier: SkillTier | null
  maxTier: SkillTier | null
  organizerId: string
  organizer: { displayName: string | null; avatarUrl: string | null }
  participants: Participant[]
  brackets: Bracket[]
  _count: { participants: number }
}

const statusLabels: Record<string, string> = {
  REGISTRATION: 'Inscripcion abierta',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

const statusVariant: Record<string, 'warning' | 'success' | 'destructive' | 'primary' | 'default'> = {
  REGISTRATION: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
}

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [starting, setStarting] = useState(false)
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await fetch(`/api/tournaments/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTournament(data)
        } else {
          toast.error('No se pudo cargar el torneo')
        }
      } catch {
        toast.error('Error de conexion')
      } finally {
        setLoading(false)
      }
    }

    async function fetchProfile() {
      try {
        const res = await fetch('/api/player/profile')
        if (res.ok) {
          const data = await res.json()
          setCurrentProfileId(data.id)
        }
      } catch {
        // Not logged in or no profile
      }
    }

    fetchTournament()
    fetchProfile()
  }, [id])

  const isRegistered = tournament?.participants.some(
    (p) => p.profileId === currentProfileId
  )

  const isOrganizer = tournament?.organizerId === currentProfileId

  async function handleRegister() {
    setRegistering(true)
    try {
      const res = await fetch(`/api/tournaments/${id}/register`, { method: 'POST' })
      if (res.ok) {
        toast.success('Te has inscrito al torneo')
        const updated = await fetch(`/api/tournaments/${id}`)
        if (updated.ok) setTournament(await updated.json())
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al inscribirse')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setRegistering(false)
    }
  }

  async function handleStart() {
    setStarting(true)
    try {
      const res = await fetch(`/api/tournaments/${id}/start`, { method: 'POST' })
      if (res.ok) {
        toast.success('Torneo iniciado')
        const updated = await fetch(`/api/tournaments/${id}`)
        if (updated.ok) setTournament(await updated.json())
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al iniciar el torneo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setStarting(false)
    }
  }

  // Build player name map for brackets
  const playerNameMap: Record<string, string> = {}
  tournament?.participants.forEach((p) => {
    playerNameMap[p.profileId] =
      p.profile.displayName || p.profile.user.name || 'Jugador'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium text-muted-foreground">Torneo no encontrado</p>
        <GlassButton variant="outline" className="mt-4" asChild>
          <Link href="/tournaments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a torneos
          </Link>
        </GlassButton>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/tournaments" className="hover:text-foreground transition-colors">
          Torneos
        </Link>
        <span>/</span>
        <span className="text-foreground">{tournament.name}</span>
      </div>

      <GlassCard intensity="medium" padding="xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{tournament.name}</h1>
                <GlassBadge variant={statusVariant[tournament.status] || 'default'} size="sm">
                  {statusLabels[tournament.status]}
                </GlassBadge>
              </div>
              {tournament.description && (
                <p className="text-muted-foreground mt-2">{tournament.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              {tournament.status === 'REGISTRATION' && !isRegistered && currentProfileId && (
                <GlassButton
                  variant="solid"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Inscribirse
                </GlassButton>
              )}
              {isOrganizer && tournament.status === 'REGISTRATION' && (
                <GlassButton
                  variant="primary"
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Iniciar torneo
                </GlassButton>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-glass">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Formato</p>
              <p className="text-sm font-medium">{tournament.format.replace(/_/g, ' ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de inicio
              </p>
              <p className="text-sm font-medium">
                {new Date(tournament.startDate).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            {tournament.venue && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Sede
                </p>
                <p className="text-sm font-medium">{tournament.venue}</p>
              </div>
            )}
            {tournament.city && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ciudad</p>
                <p className="text-sm font-medium">{tournament.city}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Jugadores
              </p>
              <p className="text-sm font-medium">
                {tournament._count.participants}/{tournament.maxPlayers}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Organizador</p>
              <p className="text-sm font-medium">
                {tournament.organizer.displayName || 'Organizador'}
              </p>
            </div>
            {tournament.minTier && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tier minimo</p>
                <TierBadge tier={tournament.minTier} size="sm" />
              </div>
            )}
            {tournament.maxTier && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tier maximo</p>
                <TierBadge tier={tournament.maxTier} size="sm" />
              </div>
            )}
          </div>

          {isRegistered && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
              <Info className="h-4 w-4" />
              Ya estas inscrito en este torneo
            </div>
          )}
        </div>
      </GlassCard>

      {/* Participants */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Participantes ({tournament._count.participants})
        </h2>
        <ParticipantList
          participants={tournament.participants.map((p) => ({
            profileId: p.profileId,
            displayName: p.profile.displayName,
            avatarUrl: p.profile.avatarUrl,
            skillTier: p.profile.skillTier,
            effectiveScore: p.profile.effectiveScore,
            seed: p.seed,
            eliminated: p.eliminated,
            finalPosition: p.finalPosition,
            userName: p.profile.user.name,
          }))}
        />
      </div>

      {/* Bracket */}
      {(tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') &&
        tournament.brackets.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Bracket
            </h2>
            <BracketView
              brackets={tournament.brackets.map((b) => ({
                id: b.id,
                round: b.round,
                position: b.position,
                player1Id: b.player1Id,
                player2Id: b.player2Id,
                winnerId: b.winnerId,
                match: b.match ? { score: b.match.score } : undefined,
                player1Name: b.player1Id ? playerNameMap[b.player1Id] : undefined,
                player2Name: b.player2Id ? playerNameMap[b.player2Id] : undefined,
              }))}
            />
          </div>
        )}
    </div>
  )
}
