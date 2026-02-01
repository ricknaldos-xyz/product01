import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { challengeLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { Prisma } from '@prisma/client'
import { isBlocked } from '@/lib/blocks'
import { z } from 'zod'

const createChallengeSchema = z.object({
  challengedUserId: z.string(),
  proposedDate: z.string().optional(),
  proposedTime: z.string().optional(),
  proposedVenue: z.string().optional(),
  message: z.string().max(500).optional(),
  sportSlug: z.string().optional(),
})

// POST - Send a challenge
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await challengeLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = createChallengeSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { challengedUserId, proposedDate, proposedTime, proposedVenue, message, sportSlug: challengeSportSlug } = validated.data

    const sport = challengeSportSlug
      ? await prisma.sport.findUnique({
          where: { slug: challengeSportSlug },
          select: { id: true },
        })
      : null

    // Get both profiles
    const [challengerProfile, challengedProfile] = await Promise.all([
      prisma.playerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
      prisma.playerProfile.findUnique({ where: { userId: challengedUserId }, select: { id: true } }),
    ])

    if (!challengerProfile) {
      return NextResponse.json({ error: 'Completa tu perfil primero' }, { status: 400 })
    }
    if (!challengedProfile) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }
    if (challengerProfile.id === challengedProfile.id) {
      return NextResponse.json({ error: 'No puedes desafiarte a ti mismo' }, { status: 400 })
    }

    // Check if blocked
    if (await isBlocked(challengerProfile.id, challengedProfile.id)) {
      return NextResponse.json({ error: 'No puedes realizar esta accion' }, { status: 403 })
    }

    // Check for existing pending challenge
    const existing = await prisma.challenge.findFirst({
      where: {
        challengerId: challengerProfile.id,
        challengedId: challengedProfile.id,
        status: 'PENDING',
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya tienes un desafio pendiente con este jugador' },
        { status: 400 }
      )
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 72)

    const challenge = await prisma.challenge.create({
      data: {
        challengerId: challengerProfile.id,
        challengedId: challengedProfile.id,
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        proposedTime,
        proposedVenue,
        message,
        expiresAt,
        sportId: sport?.id ?? null,
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    logger.error('Create challenge error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - List challenges (sent and received)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'

    const sportSlug = searchParams.get('sport') || 'tennis'
    const sport = await prisma.sport.findUnique({
      where: { slug: sportSlug },
      select: { id: true },
    })

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const where: Prisma.ChallengeWhereInput = {}
    if (type === 'sent') {
      where.challengerId = profile.id
    } else if (type === 'received') {
      where.challengedId = profile.id
    } else {
      where.OR = [
        { challengerId: profile.id },
        { challengedId: profile.id },
      ]
    }

    if (sport) {
      where.AND = [
        { sportId: sport.id },
      ]
    }

    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const include = {
      challenger: {
        select: {
          userId: true,
          displayName: true,
          avatarUrl: true,
          skillTier: true,
          compositeScore: true,
          user: { select: { name: true, image: true } },
        },
      },
      challenged: {
        select: {
          userId: true,
          displayName: true,
          avatarUrl: true,
          skillTier: true,
          compositeScore: true,
          user: { select: { name: true, image: true } },
        },
      },
    }

    if (!paginated) {
      const challenges = await prisma.challenge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      })
      return NextResponse.json(challenges)
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ])

    return NextResponse.json({
      data: challenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('List challenges error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
