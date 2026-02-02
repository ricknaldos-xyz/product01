'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import {
  Swords, Loader2, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, XCircle, Trophy,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MatchResultType = 'WIN' | 'LOSS' | 'NO_SHOW' | null
type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED'

interface PlayerUser {
  name: string | null
  email: string | null
  image: string | null
}

interface PlayerProfile {
  id: string
  user: PlayerUser
  matchElo: number
}

interface MatchRecord {
  id: string
  challengeId: string | null
  player1Id: string
  player1: PlayerProfile
  player2Id: string
  player2: PlayerProfile
  player1Result: MatchResultType
  player2Result: MatchResultType
  score: string | null
  player1Confirmed: boolean
  player2Confirmed: boolean
  player1EloChange: number | null
  player2EloChange: number | null
  venue: string | null
  playedAt: string | null
  createdAt: string
}

interface ChallengeRecord {
  id: string
  challengerId: string
  challenger: PlayerProfile
  challengedId: string
  challenged: PlayerProfile
  status: ChallengeStatus
  proposedDate: string | null
  proposedTime: string | null
  proposedVenue: string | null
  message: string | null
  responseMessage: string | null
  respondedAt: string | null
  expiresAt: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MATCH_TABS: { label: string; value: string }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Disputados', value: 'disputed' },
  { label: 'Sin Confirmar', value: 'unconfirmed' },
]

const CHALLENGE_STATUS_OPTIONS: { label: string; value: ChallengeStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aceptados', value: 'ACCEPTED' },
  { label: 'Rechazados', value: 'DECLINED' },
  { label: 'Cancelados', value: 'CANCELLED' },
  { label: 'Completados', value: 'COMPLETED' },
  { label: 'Expirados', value: 'EXPIRED' },
]

const RESULT_OPTIONS: { label: string; value: MatchResultType }[] = [
  { label: '-- Sin resultado --', value: null },
  { label: 'Victoria', value: 'WIN' },
  { label: 'Derrota', value: 'LOSS' },
  { label: 'No se presento', value: 'NO_SHOW' },
]

const CHALLENGE_STATUS_CONFIG: Record<ChallengeStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  ACCEPTED: { label: 'Aceptado', variant: 'primary' },
  DECLINED: { label: 'Rechazado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'outline' },
  COMPLETED: { label: 'Completado', variant: 'success' },
  EXPIRED: { label: 'Expirado', variant: 'default' },
}

// ---------------------------------------------------------------------------
// Helper: format date
// ---------------------------------------------------------------------------

function fmtDate(d: string | null): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function playerName(p: PlayerProfile): string {
  return p.user.name || p.user.email || 'Jugador'
}

// ---------------------------------------------------------------------------
// Component: Match Override Form
// ---------------------------------------------------------------------------

function MatchOverrideForm({
  match,
  onSaved,
}: {
  match: MatchRecord
  onSaved: () => void
}) {
  const [p1Result, setP1Result] = useState<MatchResultType>(match.player1Result)
  const [p2Result, setP2Result] = useState<MatchResultType>(match.player2Result)
  const [score, setScore] = useState(match.score || '')
  const [p1Elo, setP1Elo] = useState(match.player1EloChange?.toString() || '')
  const [p2Elo, setP2Elo] = useState(match.player2EloChange?.toString() || '')
  const [p1Confirmed, setP1Confirmed] = useState(match.player1Confirmed)
  const [p2Confirmed, setP2Confirmed] = useState(match.player2Confirmed)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        player1Result: p1Result,
        player2Result: p2Result,
        score: score || null,
        player1Confirmed: p1Confirmed,
        player2Confirmed: p2Confirmed,
      }
      if (p1Elo !== '') body.player1EloChange = parseInt(p1Elo)
      if (p2Elo !== '') body.player2EloChange = parseInt(p2Elo)

      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Partido actualizado')
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-glass space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Sobrescribir resultado
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player 1 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {playerName(match.player1)} (J1)
          </label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={p1Result || ''}
            onChange={(e) => setP1Result((e.target.value || null) as MatchResultType)}
          >
            {RESULT_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={opt.value || ''}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p1Confirmed}
              onChange={(e) => setP1Confirmed(e.target.checked)}
              className="rounded"
            />
            Confirmado
          </label>
          <input
            type="number"
            placeholder="Cambio Elo J1"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={p1Elo}
            onChange={(e) => setP1Elo(e.target.value)}
          />
        </div>

        {/* Player 2 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {playerName(match.player2)} (J2)
          </label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={p2Result || ''}
            onChange={(e) => setP2Result((e.target.value || null) as MatchResultType)}
          >
            {RESULT_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={opt.value || ''}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p2Confirmed}
              onChange={(e) => setP2Confirmed(e.target.checked)}
              className="rounded"
            />
            Confirmado
          </label>
          <input
            type="number"
            placeholder="Cambio Elo J2"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={p2Elo}
            onChange={(e) => setP2Elo(e.target.value)}
          />
        </div>
      </div>

      {/* Score */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Marcador</label>
        <input
          type="text"
          placeholder="Ej: 6-3 7-5"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <GlassButton
          variant="solid"
          size="sm"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Guardar cambios
        </GlassButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminMatchesPage() {
  // Matches state
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)
  const [matchFilter, setMatchFilter] = useState('all')
  const [matchPage, setMatchPage] = useState({ page: 1, totalPages: 1, total: 0 })
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  // Challenges state
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([])
  const [challengesLoading, setChallengesLoading] = useState(true)
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus | 'ALL'>('ALL')
  const [challengePage, setChallengePage] = useState({ page: 1, totalPages: 1, total: 0 })

  // ---------------------------------------------------------------------------
  // Fetch matches
  // ---------------------------------------------------------------------------

  const fetchMatches = useCallback(async (filter: string, page = 1) => {
    setMatchesLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', filter })
      const res = await fetch(`/api/admin/matches?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMatches(data.matches)
        setMatchPage({ page: data.page, totalPages: data.totalPages, total: data.total })
      } else {
        toast.error('Error al cargar partidos')
      }
    } catch (error) {
      logger.error('Error fetching matches:', error)
      toast.error('Error de conexion')
    } finally {
      setMatchesLoading(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Fetch challenges
  // ---------------------------------------------------------------------------

  const fetchChallenges = useCallback(async (status: ChallengeStatus | 'ALL', page = 1) => {
    setChallengesLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status !== 'ALL') params.set('status', status)
      const res = await fetch(`/api/admin/challenges?${params}`)
      if (res.ok) {
        const data = await res.json()
        setChallenges(data.challenges)
        setChallengePage({ page: data.page, totalPages: data.totalPages, total: data.total })
      } else {
        toast.error('Error al cargar desafios')
      }
    } catch (error) {
      logger.error('Error fetching challenges:', error)
      toast.error('Error de conexion')
    } finally {
      setChallengesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMatches(matchFilter)
  }, [matchFilter, fetchMatches])

  useEffect(() => {
    fetchChallenges(challengeStatus)
  }, [challengeStatus, fetchChallenges])

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function resultBadge(result: MatchResultType) {
    if (!result) return <GlassBadge variant="outline" size="sm">Sin resultado</GlassBadge>
    const config: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
      WIN: { label: 'Victoria', variant: 'success' },
      LOSS: { label: 'Derrota', variant: 'destructive' },
      NO_SHOW: { label: 'No show', variant: 'warning' },
    }
    const c = config[result]
    return <GlassBadge variant={c.variant} size="sm">{c.label}</GlassBadge>
  }

  function confirmedIcon(confirmed: boolean) {
    return confirmed ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    )
  }

  function isDisputed(m: MatchRecord): boolean {
    if (!m.player1Result || !m.player2Result) return false
    // Valid pairs: WIN/LOSS, LOSS/WIN
    const valid =
      (m.player1Result === 'WIN' && m.player2Result === 'LOSS') ||
      (m.player1Result === 'LOSS' && m.player2Result === 'WIN')
    return !valid
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Swords className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Partidos y Desafios</h1>
      </div>

      {/* ================================================================== */}
      {/* MATCHES SECTION */}
      {/* ================================================================== */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Partidos</h2>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {MATCH_TABS.map((tab) => (
            <GlassButton
              key={tab.value}
              variant={matchFilter === tab.value ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => {
                setMatchFilter(tab.value)
                setMatchPage((prev) => ({ ...prev, page: 1 }))
              }}
            >
              {tab.label}
            </GlassButton>
          ))}
        </div>

        {!matchesLoading && (
          <p className="text-sm text-muted-foreground">
            {matchPage.total} partido{matchPage.total !== 1 ? 's' : ''} encontrado{matchPage.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading */}
        {matchesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} intensity="light" padding="lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 w-64 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-muted rounded-full" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <GlassCard intensity="light" padding="xl">
            <div className="text-center space-y-3">
              <Swords className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No hay partidos</h3>
              <p className="text-muted-foreground text-sm">
                No se encontraron partidos con el filtro seleccionado.
              </p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const disputed = isDisputed(match)
              const expanded = expandedMatch === match.id

              return (
                <GlassCard
                  key={match.id}
                  intensity="light"
                  padding="lg"
                  className={disputed ? 'ring-1 ring-warning/40' : ''}
                >
                  <div className="space-y-3">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {disputed && <AlertTriangle className="h-4 w-4 text-warning" />}
                        <span className="font-semibold">{playerName(match.player1)}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{playerName(match.player2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.score && (
                          <GlassBadge variant="primary" size="sm">{match.score}</GlassBadge>
                        )}
                        <span className="text-xs text-muted-foreground">{fmtDate(match.playedAt || match.createdAt)}</span>
                      </div>
                    </div>

                    {/* Results row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-8">J1:</span>
                        {resultBadge(match.player1Result)}
                        {confirmedIcon(match.player1Confirmed)}
                        {match.player1EloChange != null && (
                          <span className={`text-xs font-medium ${match.player1EloChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {match.player1EloChange >= 0 ? '+' : ''}{match.player1EloChange}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-8">J2:</span>
                        {resultBadge(match.player2Result)}
                        {confirmedIcon(match.player2Confirmed)}
                        {match.player2EloChange != null && (
                          <span className={`text-xs font-medium ${match.player2EloChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {match.player2EloChange >= 0 ? '+' : ''}{match.player2EloChange}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Venue */}
                    {match.venue && (
                      <p className="text-xs text-muted-foreground">Sede: {match.venue}</p>
                    )}

                    {/* Expand toggle */}
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedMatch(expanded ? null : match.id)}
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Cerrar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Editar resultado
                        </>
                      )}
                    </GlassButton>

                    {/* Override form */}
                    {expanded && (
                      <MatchOverrideForm
                        match={match}
                        onSaved={() => {
                          setExpandedMatch(null)
                          fetchMatches(matchFilter, matchPage.page)
                        }}
                      />
                    )}
                  </div>
                </GlassCard>
              )
            })}

            {/* Pagination */}
            {matchPage.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={matchPage.page <= 1}
                  onClick={() => {
                    const p = matchPage.page - 1
                    setMatchPage((prev) => ({ ...prev, page: p }))
                    fetchMatches(matchFilter, p)
                  }}
                >
                  Anterior
                </GlassButton>
                <span className="text-sm text-muted-foreground">
                  Pagina {matchPage.page} de {matchPage.totalPages}
                </span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={matchPage.page >= matchPage.totalPages}
                  onClick={() => {
                    const p = matchPage.page + 1
                    setMatchPage((prev) => ({ ...prev, page: p }))
                    fetchMatches(matchFilter, p)
                  }}
                >
                  Siguiente
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* CHALLENGES SECTION */}
      {/* ================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Desafios</h2>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {CHALLENGE_STATUS_OPTIONS.map((opt) => (
            <GlassButton
              key={opt.value}
              variant={challengeStatus === opt.value ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => {
                setChallengeStatus(opt.value)
                setChallengePage((prev) => ({ ...prev, page: 1 }))
              }}
            >
              {opt.label}
            </GlassButton>
          ))}
        </div>

        {!challengesLoading && (
          <p className="text-sm text-muted-foreground">
            {challengePage.total} desafio{challengePage.total !== 1 ? 's' : ''} encontrado{challengePage.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Loading */}
        {challengesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} intensity="light" padding="lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 w-64 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <GlassCard intensity="light" padding="xl">
            <div className="text-center space-y-3">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No hay desafios</h3>
              <p className="text-muted-foreground text-sm">
                No se encontraron desafios con el filtro seleccionado.
              </p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {challenges.map((ch) => {
              const statusCfg = CHALLENGE_STATUS_CONFIG[ch.status]
              return (
                <GlassCard key={ch.id} intensity="light" padding="lg">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{playerName(ch.challenger)}</span>
                        <span className="text-muted-foreground">desafia a</span>
                        <span className="font-semibold">{playerName(ch.challenged)}</span>
                      </div>
                      <GlassBadge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </GlassBadge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                      {ch.proposedDate && (
                        <div>
                          <span className="text-muted-foreground">Fecha: </span>
                          <span className="font-medium">{fmtDate(ch.proposedDate)}</span>
                        </div>
                      )}
                      {ch.proposedTime && (
                        <div>
                          <span className="text-muted-foreground">Hora: </span>
                          <span className="font-medium">{ch.proposedTime}</span>
                        </div>
                      )}
                      {ch.proposedVenue && (
                        <div>
                          <span className="text-muted-foreground">Sede: </span>
                          <span className="font-medium">{ch.proposedVenue}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Expira: </span>
                        <span className="font-medium">{fmtDate(ch.expiresAt)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Creado: </span>
                        <span className="font-medium">{fmtDate(ch.createdAt)}</span>
                      </div>
                    </div>

                    {ch.message && (
                      <p className="text-sm text-muted-foreground italic">&quot;{ch.message}&quot;</p>
                    )}
                    {ch.responseMessage && (
                      <p className="text-sm text-muted-foreground italic">
                        Respuesta: &quot;{ch.responseMessage}&quot;
                      </p>
                    )}
                  </div>
                </GlassCard>
              )
            })}

            {/* Pagination */}
            {challengePage.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={challengePage.page <= 1}
                  onClick={() => {
                    const p = challengePage.page - 1
                    setChallengePage((prev) => ({ ...prev, page: p }))
                    fetchChallenges(challengeStatus, p)
                  }}
                >
                  Anterior
                </GlassButton>
                <span className="text-sm text-muted-foreground">
                  Pagina {challengePage.page} de {challengePage.totalPages}
                </span>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={challengePage.page >= challengePage.totalPages}
                  onClick={() => {
                    const p = challengePage.page + 1
                    setChallengePage((prev) => ({ ...prev, page: p }))
                    fetchChallenges(challengeStatus, p)
                  }}
                >
                  Siguiente
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
