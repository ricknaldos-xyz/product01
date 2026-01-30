import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createMatchSchema = z.object({
  opponentUserId: z.string(),
  score: z.string().optional(),
  sets: z.array(z.object({ p1: z.number(), p2: z.number() })).optional(),
  venue: z.string().optional(),
  playedAt: z.string().optional(),
})

// POST - Register a match result
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createMatchSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { opponentUserId, score, sets, venue, playedAt } = validated.data

    const [myProfile, opponentProfile] = await Promise.all([
      prisma.playerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
      prisma.playerProfile.findUnique({ where: { userId: opponentUserId }, select: { id: true } }),
    ])

    if (!myProfile || !opponentProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const match = await prisma.match.create({
      data: {
        player1Id: myProfile.id,
        player2Id: opponentProfile.id,
        score,
        sets: sets || [],
        venue,
        playedAt: playedAt ? new Date(playedAt) : new Date(),
        player1Confirmed: true,
      },
    })

    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    logger.error('Create match error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - Match history
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { player1Id: profile.id },
        { player2Id: profile.id },
      ],
    }
    const include = {
      player1: {
        select: {
          userId: true,
          displayName: true,
          avatarUrl: true,
          skillTier: true,
          user: { select: { name: true, image: true } },
        },
      },
      player2: {
        select: {
          userId: true,
          displayName: true,
          avatarUrl: true,
          skillTier: true,
          user: { select: { name: true, image: true } },
        },
      },
    }

    if (!paginated) {
      const matches = await prisma.match.findMany({
        where,
        orderBy: { playedAt: 'desc' },
        include,
      })
      return NextResponse.json(matches)
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { playedAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.match.count({ where }),
    ])

    return NextResponse.json({
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Get matches error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
