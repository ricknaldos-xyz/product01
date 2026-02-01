import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { tournamentLimiter } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { Prisma, SkillTier, TournamentStatus } from '@prisma/client'
import { z } from 'zod'

const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN']).optional().default('SINGLE_ELIMINATION'),
  maxPlayers: z.number().int().min(4).max(64).optional().default(16),
  minTier: z.string().optional(),
  maxTier: z.string().optional(),
  ageGroup: z.string().optional(),
  registrationEnd: z.string(),
  startDate: z.string(),
  venue: z.string().optional(),
  city: z.string().optional(),
  clubId: z.string().optional(),
  sportSlug: z.string().optional().default('tennis'),
})

// POST - Create tournament
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await tournamentLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = createTournamentSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, country: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const { sportSlug: tournamentSportSlug, ...restData } = validated.data

    const sport = await prisma.sport.findUnique({
      where: { slug: tournamentSportSlug },
      select: { id: true },
    })

    const slug = restData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now().toString(36)

    const tournament = await prisma.tournament.create({
      data: {
        ...restData,
        slug,
        organizerId: profile.id,
        country: profile.country,
        registrationEnd: new Date(restData.registrationEnd),
        startDate: new Date(restData.startDate),
        minTier: restData.minTier as SkillTier | undefined,
        maxTier: restData.maxTier as SkillTier | undefined,
        sportId: sport?.id ?? null,
      },
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    logger.error('Create tournament error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - List tournaments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const country = searchParams.get('country') || 'PE'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const sportSlug = searchParams.get('sport') || 'tennis'
    const sport = await prisma.sport.findUnique({
      where: { slug: sportSlug },
      select: { id: true },
    })

    const where: Prisma.TournamentWhereInput = { country }
    if (status && Object.values(TournamentStatus).includes(status as TournamentStatus)) {
      where.status = status as TournamentStatus
    }
    if (sport) {
      where.OR = [{ sportId: sport.id }, { sportId: null }]
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
        include: {
          organizer: {
            select: { displayName: true, avatarUrl: true },
          },
          _count: { select: { participants: true } },
        },
      }),
      prisma.tournament.count({ where }),
    ])

    return NextResponse.json({
      tournaments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('List tournaments error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
