import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Current user's ranking position for a sport
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sportSlug = searchParams.get('sport') || 'tennis'

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        country: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Find SportProfile for the requested sport
    const sport = await prisma.sport.findUnique({
      where: { slug: sportSlug },
      select: { id: true },
    })

    if (!sport) {
      return NextResponse.json({ error: 'Deporte no encontrado' }, { status: 404 })
    }

    const sportProfile = await prisma.sportProfile.findUnique({
      where: {
        profileId_sportId: {
          profileId: profile.id,
          sportId: sport.id,
        },
      },
      select: {
        id: true,
        compositeScore: true,
        effectiveScore: true,
        skillTier: true,
        globalRank: true,
        countryRank: true,
        totalTechniques: true,
      },
    })

    if (!sportProfile) {
      return NextResponse.json({
        compositeScore: null,
        effectiveScore: null,
        skillTier: 'UNRANKED',
        globalRank: null,
        countryRank: null,
        country: profile.country,
        totalInCountry: 0,
        totalInTier: 0,
      })
    }

    // Get technique scores for breakdown
    const techniqueScores = await prisma.techniqueScore.findMany({
      where: {
        profileId: profile.id,
        sportProfileId: sportProfile.id,
      },
      select: {
        bestScore: true,
        lastAnalyzedAt: true,
        technique: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { bestScore: 'desc' },
    })

    // Get ranking record for previousRank
    const rankingRecord = await prisma.ranking.findFirst({
      where: {
        profileId: profile.id,
        sportId: sport.id,
        period: 'MONTHLY',
        category: 'COUNTRY',
      },
      select: { previousRank: true },
    })

    // Compute score variance for confidence indicator
    let scoreVariance: number | null = null
    if (techniqueScores.length >= 2) {
      const scores = techniqueScores.map(t => t.bestScore)
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length
      const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
      scoreVariance = Math.round(Math.sqrt(variance) * 10) / 10
    }

    // Count total players in same country for this sport
    const totalInCountry = await prisma.sportProfile.count({
      where: {
        sportId: sport.id,
        effectiveScore: { not: null },
        skillTier: { not: 'UNRANKED' },
        profile: {
          country: profile.country,
          visibility: { not: 'PRIVATE' },
        },
      },
    })

    // Count total players in same tier for this sport
    const totalInTier = sportProfile.skillTier !== 'UNRANKED'
      ? await prisma.sportProfile.count({
          where: {
            sportId: sport.id,
            skillTier: sportProfile.skillTier,
            profile: {
              visibility: { not: 'PRIVATE' },
            },
          },
        })
      : 0

    return NextResponse.json({
      compositeScore: sportProfile.compositeScore,
      effectiveScore: sportProfile.effectiveScore,
      skillTier: sportProfile.skillTier,
      globalRank: sportProfile.globalRank,
      countryRank: sportProfile.countryRank,
      country: profile.country,
      totalInCountry,
      totalInTier,
      previousRank: rankingRecord?.previousRank ?? null,
      scoreVariance,
      techniqueBreakdown: techniqueScores.map((ts) => ({
        technique: { name: ts.technique.name, slug: ts.technique.slug },
        bestScore: ts.bestScore,
        lastAnalyzedAt: ts.lastAnalyzedAt?.toISOString() ?? null,
      })),
    })
  } catch (error) {
    logger.error('Get my position error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
