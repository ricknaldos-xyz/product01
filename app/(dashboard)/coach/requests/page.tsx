'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { TierBadge } from '@/components/player/TierBadge'
import { Loader2, Inbox, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { SkillTier } from '@prisma/client'

interface CoachStudentRequest {
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

export default function CoachRequestsPage() {
  const [requests, setRequests] = useState<CoachStudentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch('/api/coach/students')
        if (res.ok) {
          const data: CoachStudentRequest[] = await res.json()
          setRequests(data.filter((r) => r.status === 'PENDING_REQUEST'))
        }
      } catch {
        toast.error('Error al cargar solicitudes')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  async function handleRequest(coachStudentId: string, action: 'accept' | 'decline') {
    setProcessing(coachStudentId)
    try {
      const res = await fetch('/api/coach/students/handle-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachStudentId, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar solicitud')
        return
      }

      setRequests((prev) => prev.filter((r) => r.id !== coachStudentId))
      toast.success(
        action === 'accept'
          ? 'Solicitud aceptada'
          : 'Solicitud declinada'
      )
    } catch {
      toast.error('Error al procesar solicitud')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Inbox className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Solicitudes de Entrenamiento</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Sin solicitudes pendientes</p>
            <p className="text-sm mt-1">Las solicitudes de jugadores apareceran aqui</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const name = r.student.displayName || r.student.user.name || 'Jugador'
            const isProcessing = processing === r.id

            return (
              <GlassCard key={r.id} intensity="light" padding="md">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {r.student.avatarUrl ? (
                      <Image src={r.student.avatarUrl} alt="" fill className="object-cover rounded-full" />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{name}</p>
                      <TierBadge tier={r.student.skillTier} size="sm" />
                      <GlassBadge variant="warning">Pendiente</GlassBadge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Score: {r.student.compositeScore?.toFixed(1) || '--'} | {r.student.totalAnalyses} analisis | {r.student.totalTechniques} tecnicas
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <GlassButton
                      variant="solid"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleRequest(r.id, 'accept')}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aceptar
                        </>
                      )}
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleRequest(r.id, 'decline')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Declinar
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
