import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getBlockedProfileIds } from '@/lib/blocks'
import { boundingBox, haversineDistance } from '@/lib/geo'
import { Prisma, SkillTier } from '@prisma/client'

// GET - Discover players nearby for matchmaking
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const radiusKm = parseInt(searchParams.get('radiusKm') || '25')
    const skillTier = searchParams.get('skillTier') as SkillTier | null
    const ageGroup = searchParams.get('ageGroup')

    const myProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        region: true,
        city: true,
        country: true,
      },
    })

    if (!myProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const userLat = lat ?? myProfile.latitude
    const userLng = lng ?? myProfile.longitude

    // Get blocked profile IDs to exclude
    const blockedIds = await getBlockedProfileIds(myProfile.id)

    // Build query based on available location data
    const where: Prisma.PlayerProfileWhereInput = {
      userId: { not: session.user.id },
      visibility: 'PUBLIC',
      country: myProfile.country,
      ...(blockedIds.length > 0 ? { id: { notIn: blockedIds } } : {}),
      ...(skillTier ? { skillTier } : {}),
      ...(ageGroup ? { ageGroup } : {}),
    }

    // If GPS available, use bounding box filter
    if (userLat && userLng) {
      const bbox = boundingBox(userLat, userLng, radiusKm)
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat }
      where.longitude = { gte: bbox.minLng, lte: bbox.maxLng }
    } else {
      // Fallback: filter by region
      if (myProfile.region) {
        where.region = myProfile.region
      }
    }

    const candidates = await prisma.playerProfile.findMany({
      where,
      take: 50,
      orderBy: { effectiveScore: 'desc' },
      select: {
        id: true,
        userId: true,
        displayName: true,
        avatarUrl: true,
        region: true,
        city: true,
        latitude: true,
        longitude: true,
        skillTier: true,
        compositeScore: true,
        effectiveScore: true,
        matchesPlayed: true,
        matchElo: true,
        playStyle: true,
        ageGroup: true,
        showRealName: true,
        showLocation: true,
        user: {
          select: { name: true, image: true },
        },
      },
    })

    // Add distance if GPS is available
    const results = candidates.map((p) => {
      let distance: number | null = null
      if (userLat && userLng && p.latitude && p.longitude) {
        distance = Math.round(haversineDistance(userLat, userLng, p.latitude, p.longitude))
      }

      return {
        userId: p.userId,
        displayName: p.showRealName ? (p.displayName || p.user.name) : (p.displayName?.charAt(0) + '***'),
        avatarUrl: p.avatarUrl ?? p.user.image,
        region: p.showLocation ? p.region : null,
        city: p.showLocation ? p.city : null,
        skillTier: p.skillTier,
        compositeScore: p.compositeScore,
        matchesPlayed: p.matchesPlayed,
        matchElo: p.matchElo,
        playStyle: p.playStyle,
        ageGroup: p.ageGroup,
        distance,
      }
    })

    // Sort by distance if available, otherwise by score
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return (b.compositeScore || 0) - (a.compositeScore || 0)
    })

    return NextResponse.json(results)
  } catch (error) {
    logger.error('Matchmaking discover error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
