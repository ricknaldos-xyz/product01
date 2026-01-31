'use client'

import { useEffect, useState } from 'react'
import { GlassBadge } from '@/components/ui/glass-badge'
import { getScoreRingColor, getScoreLabel } from '@/lib/analysis-constants'
import { getTechniqueTier, getTechniqueTierLabel } from '@/lib/skill-score'

const SIZE_CONFIG = {
  sm: { px: 60, strokeWidth: 5, scoreClass: 'text-xl', denomClass: 'text-[10px]' },
  md: { px: 120, strokeWidth: 8, scoreClass: 'text-3xl', denomClass: 'text-xs' },
  lg: { px: 160, strokeWidth: 10, scoreClass: 'text-4xl', denomClass: 'text-sm' },
} as const

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const config = SIZE_CONFIG[size]
  const px = config.px
  const strokeWidth = config.strokeWidth
  const radius = (px - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = score / 10
  const offset = circumference * (1 - (mounted ? progress : 0))
  const color = getScoreRingColor(score)
  const label = getScoreLabel(score)

  // Technique tier badge (score is 0-10, getTechniqueTier expects 0-100)
  const tier = getTechniqueTier(score * 10)
  const tierLabel = getTechniqueTierLabel(tier)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: px, height: px }}>
        <svg width={px} height={px} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress arc */}
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.scoreClass} font-bold`} style={{ color }}>{score.toFixed(1)}</span>
          <span className={`${config.denomClass} text-muted-foreground`}>/10</span>
        </div>
      </div>
      {size !== 'sm' && (
        <>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <GlassBadge variant="primary" size="sm">{tierLabel}</GlassBadge>
        </>
      )}
    </div>
  )
}
