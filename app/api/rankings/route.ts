import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { SkillTier } from '@prisma/client'

// GET - Public rankings with filters, per sport
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'PE'
    const skillTier = searchParams.get('skillTier') as SkillTier | null
    const ageGroup = searchParams.get('ageGroup')
    const sportSlug = searchParams.get('sport') || 'tennis'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    // Resolve sport
    const sport = await prisma.sport.findUnique({
      where: { slug: sportSlug },
      select: { id: true, name: true, slug: true },
    })

    if (!sport) {
      return NextResponse.json({ error: 'Deporte no encontrado' }, { status: 404 })
    }

    // Query SportProfile for rankings
    const where = {
      sportId: sport.id,
      effectiveScore: { not: null },
      skillTier: skillTier ? { equals: skillTier } : { not: 'UNRANKED' as SkillTier },
      profile: {
        visibility: { not: 'PRIVATE' as const },
        country,
        ...(ageGroup ? { ageGroup } : {}),
      },
    }

    const [sportProfiles, total] = await Promise.all([
      prisma.sportProfile.findMany({
        where,
        orderBy: { effectiveScore: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          compositeScore: true,
          effectiveScore: true,
          skillTier: true,
          countryRank: true,
          matchesPlayed: true,
          matchesWon: true,
          profile: {
            select: {
              userId: true,
              displayName: true,
              avatarUrl: true,
              region: true,
              city: true,
              ageGroup: true,
              showRealName: true,
              showLocation: true,
              user: {
                select: { name: true, image: true },
              },
            },
          },
        },
      }),
      prisma.sportProfile.count({ where }),
    ])

    const rankings = sportProfiles.map((sp, index) => ({
      rank: skip + index + 1,
      userId: sp.profile.userId,
      displayName: sp.profile.showRealName
        ? (sp.profile.displayName || sp.profile.user.name)
        : (sp.profile.displayName?.charAt(0) + '***'),
      avatarUrl: sp.profile.avatarUrl ?? sp.profile.user.image,
      region: sp.profile.showLocation ? sp.profile.region : null,
      city: sp.profile.showLocation ? sp.profile.city : null,
      skillTier: sp.skillTier,
      compositeScore: sp.compositeScore,
      effectiveScore: sp.effectiveScore,
      countryRank: sp.countryRank,
      matchesPlayed: sp.matchesPlayed,
      matchesWon: sp.matchesWon,
      ageGroup: sp.profile.ageGroup,
    }))

    return NextResponse.json({
      rankings,
      sport: { id: sport.id, name: sport.name, slug: sport.slug },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Get rankings error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
