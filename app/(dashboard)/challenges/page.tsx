'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { TierBadge } from '@/components/player/TierBadge'
import { formatDate } from '@/lib/date-utils'
import { Flag, Check, X, Loader2, Clock, Swords, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'
import { useSport } from '@/contexts/SportContext'

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
  challenger: ChallengePlayer
  challenged: ChallengePlayer
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [actioning, setActioning] = useState<string | null>(null)
  const { activeSport } = useSport()

  const fetchChallenges = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/challenges?type=${tab}&sport=${activeSport?.slug || 'tennis'}`, { signal })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setChallenges(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [tab, activeSport?.slug])

  useEffect(() => {
    const controller = new AbortController()
    fetchChallenges(controller.signal)
    return () => controller.abort()
  }, [fetchChallenges])

  async function respondToChallenge(id: string, action: 'accept' | 'decline' | 'cancel') {
    setActioning(id)
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        toast.success(
          action === 'accept' ? 'Desafio aceptado!' :
          action === 'decline' ? 'Desafio rechazado' : 'Desafio cancelado'
        )
        fetchChallenges()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error('Error al procesar')
    } finally {
      setActioning(null)
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptado',
    DECLINED: 'Rechazado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Completado',
    EXPIRED: 'Expirado',
  }

  const statusVariant: Record<string, 'warning' | 'success' | 'destructive' | 'primary' | 'default'> = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    DECLINED: 'destructive',
    CANCELLED: 'destructive',
    COMPLETED: 'primary',
    EXPIRED: 'default',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Flag className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Desafios</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <GlassButton
          variant={tab === 'received' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => setTab('received')}
        >
          Recibidos
        </GlassButton>
        <GlassButton
          variant={tab === 'sent' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => setTab('sent')}
        >
          Enviados
        </GlassButton>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-16">
          <GlassCard intensity="medium" padding="xl" className="max-w-md text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
            <h2 className="text-xl font-bold mb-2">Error al cargar</h2>
            <p className="text-muted-foreground mb-6">No se pudo cargar la informacion.</p>
            <GlassButton variant="solid" onClick={() => fetchChallenges()}>
              Intentar de nuevo
            </GlassButton>
          </GlassCard>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : challenges.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center py-8">
            <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No hay desafios aun</p>
            <p className="text-sm text-muted-foreground mb-4">
              {tab === 'received' ? 'Aun no has recibido desafios' : 'Aun no has enviado desafios'}
            </p>
            <Link href="/rankings">
              <GlassButton variant="solid" size="sm">
                Buscar oponentes
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const opponent = tab === 'received' ? challenge.challenger : challenge.challenged
            const opponentName = opponent.displayName || opponent.user.name || 'Jugador'

            return (
              <GlassCard key={challenge.id} intensity="light" padding="md">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {opponent.avatarUrl || opponent.user.image ? (
                      <Image src={(opponent.avatarUrl || opponent.user.image)!} alt="" fill className="object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {opponentName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{opponentName}</p>
                      <TierBadge tier={opponent.skillTier} size="sm" />
                      <GlassBadge variant={statusVariant[challenge.status] || 'default'} size="sm">
                        {statusLabel[challenge.status]}
                      </GlassBadge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {challenge.proposedVenue && <span>{challenge.proposedVenue}</span>}
                      {challenge.proposedDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(challenge.proposedDate, 'short')}
                          {challenge.proposedTime && ` ${challenge.proposedTime}`}
                        </span>
                      )}
                      {challenge.message && <span>&quot;{challenge.message}&quot;</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {challenge.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      {tab === 'received' ? (
                        <>
                          <GlassButton
                            variant="solid"
                            size="sm"
                            onClick={() => respondToChallenge(challenge.id, 'accept')}
                            disabled={actioning === challenge.id}
                          >
                            {actioning === challenge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </GlassButton>
                          <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={() => respondToChallenge(challenge.id, 'decline')}
                            disabled={actioning === challenge.id}
                          >
                            <X className="h-4 w-4" />
                          </GlassButton>
                        </>
                      ) : (
                        <GlassButton
                          variant="outline"
                          size="sm"
                          onClick={() => respondToChallenge(challenge.id, 'cancel')}
                          disabled={actioning === challenge.id}
                        >
                          Cancelar
                        </GlassButton>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
