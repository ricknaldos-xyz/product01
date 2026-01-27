'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { TierBadge } from '@/components/player/TierBadge'
import {
  GraduationCap,
  Loader2,
  Pause,
  XCircle,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { SkillTier } from '@prisma/client'

interface CoachStudentRecord {
  id: string
  coachId: string
  studentId: string
  status: string
  canViewAnalyses: boolean
  canAssignPlans: boolean
  startedAt: string | null
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

interface Analysis {
  id: string
  overallScore: number | null
  status: string
  createdAt: string
  technique: { name: string; slug: string }
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<CoachStudentRecord | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'analyses' | 'plans'>('analyses')

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, analysesRes] = await Promise.all([
          fetch('/api/coach/students'),
          fetch(`/api/coach/students/${id}/analyses`),
        ])

        if (studentsRes.ok) {
          const allStudents = await studentsRes.json()
          const found = allStudents.find((s: CoachStudentRecord) => s.id === id)
          if (found) setStudent(found)
        }

        if (analysesRes.ok) {
          const data = await analysesRes.json()
          setAnalyses(data)
        }
      } catch {
        console.error('Failed to fetch student data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  async function updateRelationship(data: Record<string, unknown>) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/coach/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const updated = await res.json()
        setStudent((prev) => (prev ? { ...prev, ...updated } : prev))
        toast.success('Relacion actualizada')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!student) {
    return (
      <GlassCard intensity="light" padding="xl">
        <div className="text-center text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Alumno no encontrado</p>
        </div>
      </GlassCard>
    )
  }

  const name = student.student.displayName || student.student.user.name || 'Alumno'

  const statusLabels: Record<string, string> = {
    PENDING_INVITE: 'Invitacion pendiente',
    ACTIVE: 'Activo',
    PAUSED: 'Pausado',
    ENDED: 'Finalizado',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Detalle del Alumno</h1>
      </div>

      {/* Student Info */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {student.student.avatarUrl ? (
              <img
                src={student.student.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{name}</h2>
              <TierBadge tier={student.student.skillTier} size="sm" />
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  student.status === 'ACTIVE'
                    ? 'text-green-600 bg-green-100'
                    : student.status === 'PENDING_INVITE'
                    ? 'text-yellow-600 bg-yellow-100'
                    : student.status === 'PAUSED'
                    ? 'text-orange-600 bg-orange-100'
                    : 'text-muted-foreground bg-muted/50'
                }`}
              >
                {statusLabels[student.status]}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
              <span>Score: {student.student.compositeScore?.toFixed(1) || '--'}</span>
              <span>{student.student.totalAnalyses} analisis</span>
              <span>{student.student.totalTechniques} tecnicas</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {student.status === 'ACTIVE' && (
          <>
            <GlassButton
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => updateRelationship({ status: 'PAUSED' })}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </GlassButton>
            <GlassButton
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => updateRelationship({ status: 'ENDED' })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Finalizar
            </GlassButton>
            <GlassButton variant="solid" size="sm" disabled={updating}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Asignar plan
            </GlassButton>
          </>
        )}
        {student.status === 'PAUSED' && (
          <GlassButton
            variant="solid"
            size="sm"
            disabled={updating}
            onClick={() => updateRelationship({ status: 'ACTIVE' })}
          >
            Reactivar
          </GlassButton>
        )}
      </div>

      {/* Toggles */}
      <GlassCard intensity="light" padding="md">
        <h3 className="font-semibold mb-3">Permisos</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {student.canViewAnalyses ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Ver analisis del alumno</span>
            </div>
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={updating}
              onClick={() =>
                updateRelationship({ canViewAnalyses: !student.canViewAnalyses })
              }
            >
              {student.canViewAnalyses ? 'Desactivar' : 'Activar'}
            </GlassButton>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Asignar planes de entrenamiento</span>
            </div>
            <GlassButton
              variant="ghost"
              size="sm"
              disabled={updating}
              onClick={() =>
                updateRelationship({ canAssignPlans: !student.canAssignPlans })
              }
            >
              {student.canAssignPlans ? 'Desactivar' : 'Activar'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'analyses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('analyses')}
        >
          Analisis
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'plans'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('plans')}
        >
          Planes asignados
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'analyses' && (
        <div className="space-y-3">
          {analyses.length === 0 ? (
            <GlassCard intensity="light" padding="lg">
              <p className="text-center text-muted-foreground text-sm">
                Sin analisis disponibles
              </p>
            </GlassCard>
          ) : (
            analyses.map((a) => (
              <GlassCard key={a.id} intensity="light" padding="md" hover="lift" asChild>
                <Link href={`/analyses/${a.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{a.technique.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    {a.overallScore && (
                      <span className="text-sm font-semibold text-primary">
                        {a.overallScore.toFixed(1)}/10
                      </span>
                    )}
                  </div>
                </Link>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <GlassCard intensity="light" padding="lg">
          <div className="text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Los planes asignados apareceran aqui</p>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
