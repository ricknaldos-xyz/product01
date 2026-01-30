import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Public player profile (no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
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
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // Respect privacy settings
    if (profile.visibility === 'PRIVATE') {
      return NextResponse.json(
        { error: 'Este perfil es privado' },
        { status: 403 }
      )
    }

    // Build public profile response
    const publicProfile = {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.showRealName ? profile.displayName : (profile.displayName?.charAt(0) + '***'),
      bio: profile.bio,
      avatarUrl: profile.avatarUrl ?? profile.user.image,
      country: profile.country,
      region: profile.showLocation ? profile.region : null,
      city: profile.showLocation ? profile.city : null,
      playStyle: profile.playStyle,
      dominantHand: profile.dominantHand,
      backhandType: profile.backhandType,
      yearsPlaying: profile.yearsPlaying,
      ageGroup: profile.ageGroup,
      compositeScore: profile.compositeScore,
      skillTier: profile.skillTier,
      totalAnalyses: profile.totalAnalyses,
      totalTechniques: profile.totalTechniques,
      globalRank: profile.globalRank,
      countryRank: profile.countryRank,
      matchesPlayed: profile.matchesPlayed,
      matchesWon: profile.matchesWon,
      followersCount: profile.followersCount,
      followingCount: profile.followingCount,
      techniqueScores: profile.techniqueScores.map((ts) => ({
        technique: ts.technique,
        bestScore: ts.bestScore,
        averageScore: ts.averageScore,
        analysisCount: ts.analysisCount,
      })),
    }

    return NextResponse.json(publicProfile)
  } catch (error) {
    logger.error('Get public profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
