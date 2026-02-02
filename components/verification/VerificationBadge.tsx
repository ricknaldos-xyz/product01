'use client'

import { ShieldCheck, Clock, AlertTriangle, XCircle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  VERIFIED: {
    label: 'Verificado',
    icon: ShieldCheck,
    color: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950',
  },
  PENDING_REVIEW: {
    label: 'En revision',
    icon: Clock,
    color: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950',
  },
  FLAGGED: {
    label: 'Reportado',
    icon: AlertTriangle,
    color: 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950',
  },
  REJECTED: {
    label: 'Rechazado',
    icon: XCircle,
    color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950',
  },
  UNVERIFIED: {
    label: 'No verificado',
    icon: Shield,
    color: 'text-muted-foreground bg-muted',
  },
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = statusConfig[status] || statusConfig.UNVERIFIED
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
