import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const sportProfileSchema = z.object({
  sportId: z.string(),
  sportConfig: z.record(z.string(), z.string()).optional(),
})

// POST - Create or update sport profile config
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = sportProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { sportId, sportConfig } = validated.data

    // Verify sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      select: { id: true },
    })
    if (!sport) {
      return NextResponse.json({ error: 'Deporte no encontrado' }, { status: 404 })
    }

    // Get or create player profile
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ error: 'Perfil de jugador no encontrado' }, { status: 404 })
    }

    // Upsert sport profile
    const sportProfile = await prisma.sportProfile.upsert({
      where: {
        profileId_sportId: {
          profileId: profile.id,
          sportId,
        },
      },
      create: {
        profileId: profile.id,
        sportId,
        sportConfig: sportConfig || {},
      },
      update: {
        sportConfig: sportConfig || {},
      },
    })

    // Also ensure UserSport exists
    await prisma.userSport.upsert({
      where: {
        userId_sportId: {
          userId: session.user.id,
          sportId,
        },
      },
      create: {
        userId: session.user.id,
        sportId,
      },
      update: {},
    })

    return NextResponse.json(sportProfile)
  } catch (error) {
    logger.error('Sport profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Get sport profile for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sportId = searchParams.get('sportId')

    if (!sportId) {
      return NextResponse.json({ error: 'sportId requerido' }, { status: 400 })
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json(null)
    }

    const sportProfile = await prisma.sportProfile.findUnique({
      where: {
        profileId_sportId: {
          profileId: profile.id,
          sportId,
        },
      },
    })

    return NextResponse.json(sportProfile)
  } catch (error) {
    logger.error('Get sport profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
