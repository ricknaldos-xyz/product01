import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getBlockedProfileIds } from '@/lib/blocks'

// GET - Feed (own + followed players' activity)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Get blocked profile IDs to exclude from feed
    const blockedIds = await getBlockedProfileIds(profile.id)

    // Use subquery to get following IDs + own profile, excluding blocked
    const followingIds = await prisma.follow.findMany({
      where: { followerId: profile.id },
      select: { followingId: true },
    }).then(follows => follows.map(f => f.followingId))

    const profileIds = [profile.id, ...followingIds].filter(id => !blockedIds.includes(id))

    const [items, total] = await Promise.all([
      prisma.feedItem.findMany({
        where: { profileId: { in: profileIds } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          profile: {
            select: {
              userId: true,
              displayName: true,
              avatarUrl: true,
              skillTier: true,
              user: { select: { name: true, image: true } },
            },
          },
        },
      }),
      prisma.feedItem.count({
        where: { profileId: { in: profileIds } },
      }),
    ])

    return NextResponse.json({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Get feed error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
