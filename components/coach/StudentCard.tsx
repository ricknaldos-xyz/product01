'use client'

import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
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

  const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'primary' | 'default' }> = {
    PENDING_INVITE: { label: 'Pendiente', variant: 'warning' },
    PENDING_REQUEST: { label: 'Pendiente', variant: 'warning' },
    ACTIVE: { label: 'Activo', variant: 'success' },
    PAUSED: { label: 'Pausado', variant: 'warning' },
    ENDED: { label: 'Finalizado', variant: 'default' },
  }

  const statusInfo = statusConfig[student.status] || statusConfig.ENDED

  return (
    <GlassCard intensity="light" padding="md" hover="lift" asChild>
      <Link href={`/coach/students/${student.id}`}>
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {student.avatarUrl ? (
              <Image
                src={student.avatarUrl}
                alt=""
                fill
                className="object-cover rounded-full"
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
              <GlassBadge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </GlassBadge>
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
