import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { SkillTier } from '@prisma/client'
import { sanitizeSearchString } from '@/lib/validation'

// GET - Public rankings with filters, per sport
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'PE'
    const skillTierParam = searchParams.get('skillTier')
    const ageGroup = searchParams.get('ageGroup')
    const sportSlug = searchParams.get('sport') || 'tennis'
    const search = sanitizeSearchString(searchParams.get('search'))
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
      skillTier: skillTierParam
        ? skillTierParam.includes(',')
          ? { in: skillTierParam.split(',') as SkillTier[] }
          : { equals: skillTierParam as SkillTier }
        : { not: 'UNRANKED' as SkillTier },
      profile: {
        visibility: { not: 'PRIVATE' as const },
        country,
        ...(ageGroup ? { ageGroup } : {}),
        ...(search ? { displayName: { contains: search, mode: 'insensitive' as const } } : {}),
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
          totalTechniques: true,
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

    // Get Ranking records for previousRank data
    const profileIds = sportProfiles.map(sp => sp.profile.userId)
    const rankings_db = await prisma.ranking.findMany({
      where: {
        profile: { userId: { in: profileIds } },
        sportId: sport.id,
        period: 'MONTHLY',
        category: 'COUNTRY',
      },
      select: {
        profile: { select: { userId: true } },
        previousRank: true,
      },
    })
    const previousRankMap = new Map(rankings_db.map(r => [r.profile.userId, r.previousRank]))

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
      previousRank: previousRankMap.get(sp.profile.userId) ?? null,
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
