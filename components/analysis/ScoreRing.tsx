'use client'

import { useEffect, useState } from 'react'
import { GlassBadge } from '@/components/ui/glass-badge'
import { getScoreRingColor, getScoreLabel } from '@/lib/analysis-constants'
import { getTechniqueTier, getTechniqueTierLabel } from '@/lib/skill-score'

interface ScoreRingProps {
  score: number
}

export function ScoreRing({ score }: ScoreRingProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
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
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
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
          <span className="text-3xl font-bold" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <GlassBadge variant="primary" size="sm">{tierLabel}</GlassBadge>
    </div>
  )
}
