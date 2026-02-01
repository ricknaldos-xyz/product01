'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { GraduationCap, UserPlus, Loader2, X, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'

interface Student {
  id: string
  status: string
  student: {
    userId: string
    displayName: string | null
    avatarUrl: string | null
    skillTier: SkillTier
    compositeScore: number | null
    totalAnalyses: number
    totalTechniques: number
    user: { name: string | null; email: string | null }
  }
}

interface SearchResult {
  id: string
  userId: string
  displayName: string | null
  avatarUrl: string | null
  skillTier: SkillTier
  user: { name: string | null; email: string | null }
}

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<SearchResult | null>(null)
  const [inviting, setInviting] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  async function fetchStudents() {
    try {
      const res = await fetch('/api/coach/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students ?? data)
      }
    } catch {
      logger.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const searchPlayers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/coach/students/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } catch {
      logger.error('Search failed')
    } finally {
      setSearching(false)
    }
  }, [])

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setSelectedPlayer(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchPlayers(value), 300)
  }

  async function handleInvite() {
    if (!selectedPlayer) return
    setInviting(true)
    try {
      const res = await fetch('/api/coach/students/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUserId: selectedPlayer.userId }),
      })

      if (res.ok) {
        toast.success('Invitacion enviada')
        setShowInviteModal(false)
        setSearchQuery('')
        setSearchResults([])
        setSelectedPlayer(null)
        fetchStudents()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al invitar alumno')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setInviting(false)
    }
  }

  const statusLabels: Record<string, string> = {
    PENDING_INVITE: 'Invitacion pendiente',
    PENDING_REQUEST: 'Solicitud pendiente',
    ACTIVE: 'Activo',
    PAUSED: 'Pausado',
    ENDED: 'Finalizado',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Mis Alumnos</h1>
        </div>
        <GlassButton variant="solid" size="sm" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar alumno
        </GlassButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : students.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Sin alumnos</p>
            <p className="text-sm mt-1">Invita jugadores para empezar a entrenarlos</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {students.map((s) => {
            const name = s.student.displayName || s.student.user.name || 'Alumno'

            return (
              <GlassCard key={s.id} intensity="light" padding="md" hover="lift" asChild>
                <Link href={`/coach/students/${s.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {s.student.avatarUrl ? (
                        <Image src={s.student.avatarUrl} alt="" fill className="object-cover rounded-full" />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{name}</p>
                        <TierBadge tier={s.student.skillTier} size="sm" />
                        <GlassBadge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'PAUSED' ? 'warning' : s.status === 'ENDED' ? 'default' : 'warning'} size="sm">
                          {statusLabels[s.status]}
                        </GlassBadge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.student.totalAnalyses} analisis | {s.student.totalTechniques} tecnicas | Score: {s.student.compositeScore?.toFixed(1) || '--'}
                      </p>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlassCard intensity="medium" padding="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Invitar alumno</h2>
              <button onClick={() => { setShowInviteModal(false); setSearchQuery(''); setSearchResults([]); setSelectedPlayer(null) }} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Busca un jugador por nombre o email para enviarle una invitacion.
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-glass bg-background/50 text-sm"
                autoFocus
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Selected player */}
            {selectedPlayer && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5 mb-4">
                <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedPlayer.avatarUrl ? (
                    <Image src={selectedPlayer.avatarUrl} alt="" fill className="object-cover rounded-full" />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {(selectedPlayer.displayName || selectedPlayer.user.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedPlayer.displayName || selectedPlayer.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedPlayer.user.email}</p>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Search results */}
            {!selectedPlayer && searchResults.length > 0 && (
              <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1 mb-4">
                {searchResults.map((player) => {
                  const pName = player.displayName || player.user.name || 'Jugador'
                  return (
                    <button
                      key={player.id}
                      onClick={() => { setSelectedPlayer(player); setSearchResults([]) }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-left transition-colors"
                    >
                      <div className="relative h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {player.avatarUrl ? (
                          <Image src={player.avatarUrl} alt="" fill className="object-cover rounded-full" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{pName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pName}</p>
                        <p className="text-xs text-muted-foreground truncate">{player.user.email}</p>
                      </div>
                      <TierBadge tier={player.skillTier} size="sm" />
                    </button>
                  )
                })}
              </div>
            )}

            {!selectedPlayer && searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 mb-4">No se encontraron jugadores</p>
            )}

            <div className="flex gap-3 justify-end">
              <GlassButton variant="ghost" size="sm" onClick={() => { setShowInviteModal(false); setSearchQuery(''); setSearchResults([]); setSelectedPlayer(null) }}>
                Cancelar
              </GlassButton>
              <GlassButton variant="solid" size="sm" onClick={handleInvite} disabled={inviting || !selectedPlayer}>
                {inviting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Enviar invitacion
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
