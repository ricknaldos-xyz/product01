import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET - Get current user's coach profile
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: {
                userId: true,
                displayName: true,
                avatarUrl: true,
                skillTier: true,
                compositeScore: true,
              },
            },
          },
        },
        _count: { select: { students: true, reviews: true } },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de entrenador no encontrado' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    logger.error('Get coach profile error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const updateCoachSchema = z.object({
  headline: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  certifications: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  specialties: z.array(z.string()).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
})

// PATCH - Update coach profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateCoachSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.coachProfile.update({
      where: { userId: session.user.id },
      data: validated.data,
    })

    return NextResponse.json(profile)
  } catch (error) {
    logger.error('Update coach profile error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create coach profile (for player upgrade)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existing = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: 'Ya tienes un perfil de entrenador' }, { status: 400 })
    }

    const body = await request.json()

    const profile = await prisma.coachProfile.create({
      data: {
        userId: session.user.id,
        headline: body.headline,
        bio: body.bio,
        country: body.country || 'PE',
        city: body.city,
      },
    })

    // Update account type
    await prisma.user.update({
      where: { id: session.user.id },
      data: { accountType: 'COACH' },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    logger.error('Create coach profile error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
