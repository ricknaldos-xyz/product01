import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET - Get current user's player profile
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
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
        { error: 'Perfil de jugador no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    logger.error('Get player profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  playStyle: z.string().optional(),
  dominantHand: z.enum(['right', 'left']).optional(),
  backhandType: z.enum(['one-handed', 'two-handed']).optional(),
  yearsPlaying: z.number().int().min(0).max(80).optional(),
  ageGroup: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE']).optional(),
  showRealName: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  maxTravelKm: z.number().int().min(1).max(500).optional(),
})

// PATCH - Update current user's player profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.update({
      where: { userId: session.user.id },
      data: validated.data,
    })

    return NextResponse.json(profile)
  } catch (error) {
    logger.error('Update player profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
