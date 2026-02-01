'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GraduationCap, Users, Star, UserPlus, Loader2, ArrowRight } from 'lucide-react'
import { TierBadge } from '@/components/player/TierBadge'
import Link from 'next/link'
import type { SkillTier } from '@prisma/client'

interface CoachProfile {
  id: string
  headline: string | null
  averageRating: number | null
  totalReviews: number
  students: {
    id: string
    status: string
    student: {
      userId: string
      displayName: string | null
      avatarUrl: string | null
      skillTier: SkillTier
      compositeScore: number | null
    }
  }[]
  _count: { students: number; reviews: number }
}

interface StudentRecord {
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

export default function CoachDashboardPage() {
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, studentsRes] = await Promise.all([
          fetch('/api/coach/profile'),
          fetch('/api/coach/students'),
        ])

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json()
          setStudents(studentsData.students ?? studentsData)
        }
      } catch {
        logger.error('Failed to fetch coach data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activeStudents = students.filter((s) => s.status === 'ACTIVE')
  const pendingInvites = students.filter((s) => s.status === 'PENDING_INVITE')
  const recentStudents = students.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Panel de Entrenador</h1>
        </div>
        <GlassButton variant="solid" size="sm" asChild>
          <Link href="/marketplace">
            Ver marketplace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </GlassButton>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="glass-ultralight border-glass rounded-xl p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="font-semibold text-2xl">{activeStudents.length}</h3>
          <p className="text-sm text-muted-foreground">Alumnos activos</p>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="glass-ultralight border-glass rounded-xl p-2">
              <UserPlus className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <h3 className="font-semibold text-2xl">{pendingInvites.length}</h3>
          <p className="text-sm text-muted-foreground">Invitaciones pendientes</p>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="glass-ultralight border-glass rounded-xl p-2">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <h3 className="font-semibold text-2xl">
            {profile?.averageRating?.toFixed(1) || '--'}
          </h3>
          <p className="text-sm text-muted-foreground">Calificacion promedio</p>
        </GlassCard>

        <GlassCard intensity="light" padding="lg" hover="lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="glass-ultralight border-glass rounded-xl p-2">
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="font-semibold text-2xl">{profile?.totalReviews || 0}</h3>
          <p className="text-sm text-muted-foreground">Total resenas</p>
        </GlassCard>
      </div>

      {/* Recent Students */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Alumnos recientes</h2>
          <GlassButton variant="ghost" size="sm" asChild>
            <Link href="/coach/students">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </GlassButton>
        </div>

        {recentStudents.length === 0 ? (
          <GlassCard intensity="light" padding="xl">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sin alumnos</p>
              <p className="text-sm mt-1">Invita jugadores para empezar a entrenarlos</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {recentStudents.map((s) => {
              const name = s.student.displayName || s.student.user.name || 'Alumno'

              return (
                <GlassCard key={s.id} intensity="light" padding="md" hover="lift" asChild>
                  <Link href={`/coach/students/${s.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {s.student.avatarUrl ? (
                          <Image
                            src={s.student.avatarUrl}
                            alt=""
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{name}</p>
                          <TierBadge tier={s.student.skillTier} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Score: {s.student.compositeScore?.toFixed(1) || '--'}
                        </p>
                      </div>
                      <GlassBadge
                        variant={
                          s.status === 'ACTIVE'
                            ? 'success'
                            : s.status === 'PENDING_INVITE' || s.status === 'PENDING_REQUEST' || s.status === 'PAUSED'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {s.status === 'ACTIVE'
                          ? 'Activo'
                          : s.status === 'PENDING_INVITE'
                          ? 'Pendiente'
                          : s.status === 'PAUSED'
                          ? 'Pausado'
                          : 'Finalizado'}
                      </GlassBadge>
                    </div>
                  </Link>
                </GlassCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
