'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import { GraduationCap, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/coach/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
        }
      } catch {
        logger.error('Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const statusLabels: Record<string, string> = {
    PENDING_INVITE: 'Invitacion pendiente',
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
        <GlassButton variant="solid" size="sm">
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
                <Link href={`/player/${s.student.userId}`}>
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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === 'ACTIVE' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {statusLabels[s.status]}
                        </span>
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
    </div>
  )
}
