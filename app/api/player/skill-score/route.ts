import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getTierLabel } from '@/lib/skill-score'

// GET - Get current user's skill score breakdown
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        compositeScore: true,
        effectiveScore: true,
        skillTier: true,
        totalAnalyses: true,
        totalTechniques: true,
        globalRank: true,
        countryRank: true,
        lastScoreUpdate: true,
        techniqueScores: {
          include: {
            technique: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: { bestScore: 'desc' },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil de jugador no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      compositeScore: profile.compositeScore,
      effectiveScore: profile.effectiveScore,
      skillTier: profile.skillTier,
      tierLabel: getTierLabel(profile.skillTier),
      totalAnalyses: profile.totalAnalyses,
      totalTechniques: profile.totalTechniques,
      globalRank: profile.globalRank,
      countryRank: profile.countryRank,
      lastScoreUpdate: profile.lastScoreUpdate,
      techniqueBreakdown: profile.techniqueScores.map((ts) => ({
        technique: ts.technique,
        bestScore: ts.bestScore,
        averageScore: ts.averageScore,
        analysisCount: ts.analysisCount,
        lastAnalyzedAt: ts.lastAnalyzedAt,
        scoreHistory: ts.scoreHistory,
      })),
    })
  } catch (error) {
    logger.error('Get skill score error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
