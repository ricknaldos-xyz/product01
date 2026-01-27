'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { Flag, Clock, MapPin, MessageSquare, Check, X, Loader2, ArrowLeft, Swords } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { SkillTier } from '@prisma/client'

interface ChallengePlayer {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  compositeScore: number | null
  user: { name: string | null; image: string | null }
}

interface Challenge {
  id: string
  challengerId: string
  challengedId: string
  status: string
  proposedDate: string | null
  proposedTime: string | null
  proposedVenue: string | null
  message: string | null
  expiresAt: string
  createdAt: string
  matchId: string | null
  challenger: ChallengePlayer
  challenged: ChallengePlayer
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  DECLINED: 'Rechazado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
  EXPIRED: 'Expirado',
}

const statusColor: Record<string, string> = {
  PENDING: 'text-yellow-600 bg-yellow-100',
  ACCEPTED: 'text-green-600 bg-green-100',
  DECLINED: 'text-red-600 bg-red-100',
  CANCELLED: 'text-slate-500 bg-slate-100',
  COMPLETED: 'text-blue-600 bg-blue-100',
  EXPIRED: 'text-slate-400 bg-slate-100',
}

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    fetchChallenge()
  }, [id])

  async function fetchChallenge() {
    try {
      const res = await fetch(`/api/challenges?type=all`)
      if (res.ok) {
        const data: Challenge[] = await res.json()
        const found = data.find((c) => c.id === id)
        if (found) {
          setChallenge(found)
        }
      }
    } catch {
      console.error('Failed to fetch challenge')
    } finally {
      setLoading(false)
    }
  }

  async function respondToChallenge(action: 'accept' | 'decline' | 'cancel') {
    if (!challenge) return
    setActioning(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        toast.success(
          action === 'accept' ? 'Desafio aceptado!' :
          action === 'decline' ? 'Desafio rechazado' : 'Desafio cancelado'
        )
        fetchChallenge()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error('Error al procesar')
    } finally {
      setActioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Desafio no encontrado</p>
          </div>
        </GlassCard>
      </div>
    )
  }

  const currentUserId = session?.user?.id
  const isChallenger = challenge.challengerId === currentUserId
  const isChallenged = challenge.challengedId === currentUserId
  const challengerName = challenge.challenger.displayName || challenge.challenger.user.name || 'Jugador'
  const challengedName = challenge.challenged.displayName || challenge.challenged.user.name || 'Jugador'

  function renderPlayerCard(player: ChallengePlayer, role: string) {
    const name = player.displayName || player.user.name || 'Jugador'
    const avatar = player.avatarUrl || player.user.image
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <TierBadge tier={player.skillTier} size="sm" />
          <p className="text-xs text-muted-foreground mt-1">{role}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/challenges">
          <GlassButton variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
        </Link>
        <Flag className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Detalle del Desafio</h1>
      </div>

      {/* Players */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center justify-center gap-8">
          {renderPlayerCard(challenge.challenger, 'Retador')}
          <div className="flex flex-col items-center">
            <Swords className="h-8 w-8 text-muted-foreground" />
            <span className={`text-xs px-3 py-1 rounded-full font-medium mt-2 ${statusColor[challenge.status]}`}>
              {statusLabel[challenge.status]}
            </span>
          </div>
          {renderPlayerCard(challenge.challenged, 'Retado')}
        </div>
      </GlassCard>

      {/* Details */}
      <GlassCard intensity="light" padding="lg">
        <h3 className="font-semibold mb-3">Detalles</h3>
        <div className="space-y-3">
          {challenge.proposedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(challenge.proposedDate).toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {challenge.proposedTime && ` a las ${challenge.proposedTime}`}
              </span>
            </div>
          )}
          {challenge.proposedVenue && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.proposedVenue}</span>
            </div>
          )}
          {challenge.message && (
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="italic text-muted-foreground">&quot;{challenge.message}&quot;</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Creado el {new Date(challenge.createdAt).toLocaleDateString('es-PE')}
            </span>
            <span>|</span>
            <span>
              Expira el {new Date(challenge.expiresAt).toLocaleDateString('es-PE')}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      {challenge.status === 'PENDING' && isChallenged && (
        <GlassCard intensity="light" padding="lg">
          <p className="text-sm text-muted-foreground mb-3">
            {challengerName} te ha desafiado. Acepta o rechaza el desafio.
          </p>
          <div className="flex gap-3">
            <GlassButton
              variant="solid"
              onClick={() => respondToChallenge('accept')}
              disabled={actioning}
              className="flex-1"
            >
              {actioning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Aceptar
            </GlassButton>
            <GlassButton
              variant="outline"
              onClick={() => respondToChallenge('decline')}
              disabled={actioning}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Rechazar
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {challenge.status === 'PENDING' && isChallenger && (
        <GlassCard intensity="light" padding="lg">
          <p className="text-sm text-muted-foreground mb-3">
            Esperando respuesta de {challengedName}.
          </p>
          <GlassButton
            variant="outline"
            onClick={() => respondToChallenge('cancel')}
            disabled={actioning}
          >
            {actioning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Cancelar desafio
          </GlassButton>
        </GlassCard>
      )}

      {challenge.status === 'ACCEPTED' && challenge.matchId && (
        <GlassCard intensity="light" padding="lg">
          <p className="text-sm text-muted-foreground mb-3">
            El desafio fue aceptado. Puedes ver el partido asociado.
          </p>
          <Link href={`/matches/${challenge.matchId}`}>
            <GlassButton variant="solid">
              Ver partido
            </GlassButton>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}
