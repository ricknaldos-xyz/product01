'use client'

import { RankingJourney } from '@/components/rankings/RankingJourney'
import type { SkillTier } from '@prisma/client'

interface ProfileRankingGuideProps {
  techniqueScores: { technique: { name: string; slug: string }; bestScore: number }[]
  skillTier: SkillTier
}

export function ProfileRankingGuide({ techniqueScores, skillTier }: ProfileRankingGuideProps) {
  if (skillTier !== 'UNRANKED') return null

  return (
    <RankingJourney
      techniqueBreakdown={techniqueScores}
      skillTier={skillTier}
      variant="full"
    />
  )
}
