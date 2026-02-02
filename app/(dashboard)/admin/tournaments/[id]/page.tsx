'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import {
  Trophy, ArrowLeft, Loader2, Save, XCircle, Users, Calendar,
  MapPin, Hash, Swords,
} from 'lucide-react'

type TournamentStatus = 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type TournamentFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN'

interface Participant {
  id: string
  seed: number | null
  eliminated: boolean
  finalPosition: number | null
  registeredAt: string
  profile: {
    displayName: string
    avatarUrl: string | null
    skillTier: string | null
    effectiveScore: number | null
    user: { name: string | null }
  }
}

interface Bracket {
  id: string
  round: number
  position: number
  matchId: string | null
  player1Id: string | null
  player2Id: string | null
  winnerId: string | null
  scheduledAt: string | null
  match: {
    id: string
    status: string
    score1: number | null
    score2: number | null
  } | null
}

interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  format: TournamentFormat
  status: TournamentStatus
  maxPlayers: number
  minTier: string | null
  maxTier: string | null
  ageGroup: string | null
  country: string | null
  venue: string | null
  city: string | null
  startDate: string | null
  endDate: string | null
  registrationEnd: string | null
  createdAt: string
  updatedAt: string
  organizer: {
    displayName: string
    avatarUrl: string | null
    user: { name: string | null; email: string | null }
  } | null
  participants: Participant[]
  brackets: Bracket[]
  _count: { participants: number }
}

const STATUS_CONFIG: Record<TournamentStatus, { label: string; variant: 'primary' | 'warning' | 'success' | 'destructive' }> = {
  REGISTRATION: { label: 'Registro', variant: 'primary' },
  IN_PROGRESS: { label: 'En Curso', variant: 'warning' },
  COMPLETED: { label: 'Completado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SINGLE_ELIMINATION: 'Eliminacion Simple',
  DOUBLE_ELIMINATION: 'Eliminacion Doble',
  ROUND_ROBIN: 'Round Robin',
}

function formatDatetime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().slice(0, 16)
}

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<TournamentStatus>('REGISTRATION')
  const [editMaxPlayers, setEditMaxPlayers] = useState(0)
  const [editVenue, setEditVenue] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editRegistrationEnd, setEditRegistrationEnd] = useState('')

  const fetchTournament = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`)
      if (res.ok) {
        const data: Tournament = await res.json()
        setTournament(data)
        setEditName(data.name)
        setEditDescription(data.description || '')
        setEditStatus(data.status)
        setEditMaxPlayers(data.maxPlayers)
        setEditVenue(data.venue || '')
        setEditCity(data.city || '')
        setEditStartDate(toInputDate(data.startDate))
        setEditEndDate(toInputDate(data.endDate))
        setEditRegistrationEnd(toInputDate(data.registrationEnd))
      } else {
        toast.error('Torneo no encontrado')
        router.push('/admin/tournaments')
      }
    } catch (error) {
      logger.error('Error fetching tournament:', error)
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (id) fetchTournament()
  }, [id, fetchTournament])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: editName,
        description: editDescription || undefined,
        status: editStatus,
        maxPlayers: editMaxPlayers,
        venue: editVenue || undefined,
        city: editCity || undefined,
      }
      if (editStartDate) body.startDate = new Date(editStartDate).toISOString()
      if (editEndDate) body.endDate = new Date(editEndDate).toISOString()
      if (editRegistrationEnd) body.registrationEnd = new Date(editRegistrationEnd).toISOString()

      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success('Torneo actualizado exitosamente')
        fetchTournament()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al actualizar torneo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Esta seguro de cancelar este torneo? Esta accion no se puede deshacer.')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Torneo cancelado')
        fetchTournament()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al cancelar torneo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setCancelling(false)
    }
  }

  // Group brackets by round
  const bracketsByRound: Record<number, Bracket[]> = {}
  if (tournament?.brackets) {
    for (const bracket of tournament.brackets) {
      if (!bracketsByRound[bracket.round]) bracketsByRound[bracket.round] = []
      bracketsByRound[bracket.round].push(bracket)
    }
  }

  // Map participant IDs to names for bracket display
  const participantMap: Record<string, string> = {}
  if (tournament?.participants) {
    for (const p of tournament.participants) {
      participantMap[p.profile?.user?.name || p.profile?.displayName || p.id] = p.id
    }
  }
  const participantNameById: Record<string, string> = {}
  if (tournament?.participants) {
    for (const p of tournament.participants) {
      participantNameById[p.id] = p.profile?.displayName || p.profile?.user?.name || 'Desconocido'
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando torneo...</span>
        </div>
      </div>
    )
  }

  if (!tournament) return null

  const statusConfig = STATUS_CONFIG[tournament.status]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <GlassButton
        variant="ghost"
        size="sm"
        onClick={() => router.push('/admin/tournaments')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a torneos
      </GlassButton>

      {/* Tournament info card */}
      <GlassCard intensity="light" padding="lg">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{tournament.name}</h1>
            </div>
            <GlassBadge variant={statusConfig.variant} size="lg">
              {statusConfig.label}
            </GlassBadge>
          </div>

          {tournament.description && (
            <p className="text-sm text-muted-foreground">{tournament.description}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Slug: </span>
              <span className="font-medium">{tournament.slug}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Formato: </span>
              <span className="font-medium">{FORMAT_LABELS[tournament.format]}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Organizador: </span>
              <span className="font-medium">
                {tournament.organizer?.displayName || tournament.organizer?.user?.name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{tournament._count.participants} / {tournament.maxPlayers}</span>
            </div>
            {(tournament.venue || tournament.city) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{[tournament.venue, tournament.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {tournament.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{formatDatetime(tournament.startDate)}</span>
              </div>
            )}
            {tournament.endDate && (
              <div>
                <span className="text-muted-foreground">Fin: </span>
                <span className="font-medium">{formatDatetime(tournament.endDate)}</span>
              </div>
            )}
            {tournament.registrationEnd && (
              <div>
                <span className="text-muted-foreground">Cierre registro: </span>
                <span className="font-medium">{formatDatetime(tournament.registrationEnd)}</span>
              </div>
            )}
            {tournament.minTier && (
              <div>
                <span className="text-muted-foreground">Tier min: </span>
                <span className="font-medium">{tournament.minTier}</span>
              </div>
            )}
            {tournament.maxTier && (
              <div>
                <span className="text-muted-foreground">Tier max: </span>
                <span className="font-medium">{tournament.maxTier}</span>
              </div>
            )}
            {tournament.ageGroup && (
              <div>
                <span className="text-muted-foreground">Grupo edad: </span>
                <span className="font-medium">{tournament.ageGroup}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Edit form */}
      <GlassCard intensity="light" padding="lg">
        <h2 className="text-lg font-semibold mb-4">Editar Torneo</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TournamentStatus)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="REGISTRATION">Registro</option>
                <option value="IN_PROGRESS">En Curso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Descripcion</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Max Jugadores</label>
              <input
                type="number"
                value={editMaxPlayers}
                onChange={(e) => setEditMaxPlayers(parseInt(e.target.value) || 0)}
                min={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Sede</label>
              <input
                type="text"
                value={editVenue}
                onChange={(e) => setEditVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Fecha inicio</label>
              <input
                type="datetime-local"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Fecha fin</label>
              <input
                type="datetime-local"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Cierre de registro</label>
              <input
                type="datetime-local"
                value={editRegistrationEnd}
                onChange={(e) => setEditRegistrationEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <GlassButton type="submit" variant="solid" size="sm" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar cambios
            </GlassButton>
            {tournament.status !== 'CANCELLED' && (
              <GlassButton
                type="button"
                variant="destructive"
                size="sm"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancelar torneo
              </GlassButton>
            )}
          </div>
        </form>
      </GlassCard>

      {/* Participants */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Participantes ({tournament.participants.length})
          </h2>
        </div>

        {tournament.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay participantes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Jugador</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Tier</th>
                  <th className="text-center py-2 pr-4 font-medium text-muted-foreground">Seed</th>
                  <th className="text-center py-2 pr-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Posicion Final</th>
                </tr>
              </thead>
              <tbody>
                {tournament.participants.map((participant) => (
                  <tr key={participant.id} className="border-b border-glass/50">
                    <td className="py-2 pr-4">
                      <div>
                        <span className="font-medium">
                          {participant.profile?.displayName || participant.profile?.user?.name || 'Desconocido'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {participant.profile?.skillTier ? (
                        <GlassBadge variant="default" size="sm">
                          {participant.profile.skillTier}
                        </GlassBadge>
                      ) : '-'}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {participant.seed ?? '-'}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {participant.eliminated ? (
                        <GlassBadge variant="destructive" size="sm">Eliminado</GlassBadge>
                      ) : (
                        <GlassBadge variant="success" size="sm">Activo</GlassBadge>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {participant.finalPosition ? (
                        <span className="font-semibold">#{participant.finalPosition}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Brackets */}
      {Object.keys(bracketsByRound).length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Brackets</h2>
          </div>

          <div className="space-y-6">
            {Object.entries(bracketsByRound)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, brackets]) => (
                <div key={round}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    <Hash className="h-3.5 w-3.5 inline mr-1" />
                    Ronda {round}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brackets.map((bracket) => (
                      <GlassCard key={bracket.id} intensity="light" padding="md">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pos {bracket.position}</span>
                            {bracket.scheduledAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatDatetime(bracket.scheduledAt)}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className={`flex items-center gap-2 px-2 py-1 rounded ${bracket.winnerId && bracket.winnerId === bracket.player1Id ? 'bg-success/10' : ''}`}>
                              <span className={bracket.winnerId === bracket.player1Id ? 'font-semibold' : ''}>
                                {bracket.player1Id ? (participantNameById[bracket.player1Id] || 'Jugador 1') : 'TBD'}
                              </span>
                              {bracket.match && bracket.match.score1 != null && (
                                <span className="ml-auto font-mono font-semibold">{bracket.match.score1}</span>
                              )}
                            </div>
                            <div className={`flex items-center gap-2 px-2 py-1 rounded ${bracket.winnerId && bracket.winnerId === bracket.player2Id ? 'bg-success/10' : ''}`}>
                              <span className={bracket.winnerId === bracket.player2Id ? 'font-semibold' : ''}>
                                {bracket.player2Id ? (participantNameById[bracket.player2Id] || 'Jugador 2') : 'TBD'}
                              </span>
                              {bracket.match && bracket.match.score2 != null && (
                                <span className="ml-auto font-mono font-semibold">{bracket.match.score2}</span>
                              )}
                            </div>
                          </div>
                          {bracket.match && (
                            <div className="text-xs text-muted-foreground">
                              Estado: {bracket.match.status}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
