'use client'

import { cn } from '@/lib/utils'
import type { SkillTier } from '@prisma/client'

const tierConfig: Record<SkillTier, { label: string; color: string; bg: string }> = {
  UNRANKED: { label: 'Sin clasificar', color: 'text-muted-foreground', bg: 'bg-muted/50' },
  QUINTA_B: { label: '5ta B', color: 'text-amber-500', bg: 'bg-amber-50' },
  QUINTA_A: { label: '5ta A', color: 'text-amber-600', bg: 'bg-amber-100' },
  CUARTA_B: { label: '4ta B', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  CUARTA_A: { label: '4ta A', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  TERCERA_B: { label: '3ra B', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  TERCERA_A: { label: '3ra A', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  SEGUNDA_B: { label: '2da B', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  SEGUNDA_A: { label: '2da A', color: 'text-cyan-600', bg: 'bg-cyan-100' },
  PRIMERA_B: { label: '1ra B', color: 'text-violet-500', bg: 'bg-violet-50' },
  PRIMERA_A: { label: '1ra A', color: 'text-violet-600', bg: 'bg-violet-100' },
}

interface TierBadgeProps {
  tier: SkillTier
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const config = tierConfig[tier]

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        config.bg,
        config.color,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        className
      )}
    >
      {config.label}
    </span>
  )
}
