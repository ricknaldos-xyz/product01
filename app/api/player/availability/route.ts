import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { AvailabilityDay } from '@prisma/client'

// GET - Get current user's availability
export async function GET() {
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

    const availability = await prisma.playerAvailability.findMany({
      where: { profileId: profile.id },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(availability)
  } catch (error) {
    logger.error('Get availability error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      day: z.nativeEnum(AvailabilityDay),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
})

// PUT - Replace all availability slots
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = availabilitySchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Replace all slots in a transaction
    await prisma.$transaction([
      prisma.playerAvailability.deleteMany({
        where: { profileId: profile.id },
      }),
      ...validated.data.slots.map((slot) =>
        prisma.playerAvailability.create({
          data: {
            profileId: profile.id,
            ...slot,
          },
        })
      ),
    ])

    const updated = await prisma.playerAvailability.findMany({
      where: { profileId: profile.id },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Update availability error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
