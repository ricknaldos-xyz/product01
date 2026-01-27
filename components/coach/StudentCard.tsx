'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import type { SkillTier } from '@prisma/client'

interface StudentCardProps {
  student: {
    id: string
    userId: string
    displayName: string | null
    avatarUrl: string | null
    skillTier: SkillTier
    compositeScore: number | null
    totalAnalyses: number
    status: string
    userName: string | null
  }
}

export function StudentCard({ student }: StudentCardProps) {
  const name = student.displayName || student.userName || 'Alumno'

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING_INVITE: { label: 'Pendiente', className: 'text-yellow-600 bg-yellow-100' },
    ACTIVE: { label: 'Activo', className: 'text-green-600 bg-green-100' },
    PAUSED: { label: 'Pausado', className: 'text-orange-600 bg-orange-100' },
    ENDED: { label: 'Finalizado', className: 'text-muted-foreground bg-muted/50' },
  }

  const statusInfo = statusConfig[student.status] || statusConfig.ENDED

  return (
    <GlassCard intensity="light" padding="md" hover="lift" asChild>
      <Link href={`/coach/students/${student.id}`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{name}</p>
              <TierBadge tier={student.skillTier} size="sm" />
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>Score: {student.compositeScore?.toFixed(1) || '--'}</span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {student.totalAnalyses} analisis
              </span>
            </div>
          </div>
        </div>
      </Link>
    </GlassCard>
  )
}
