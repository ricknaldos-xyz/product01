import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'

const requestSchema = z.object({
  coachId: z.string(),
  message: z.string().optional(),
})

// POST - Player requests to train with a coach
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = requestSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, displayName: true, user: { select: { name: true } } },
    })

    if (!playerProfile) {
      return NextResponse.json({ error: 'Perfil de jugador no encontrado' }, { status: 404 })
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { id: validated.data.coachId },
      select: { id: true, userId: true, isAvailable: true, verificationStatus: true },
    })

    if (!coachProfile) {
      return NextResponse.json({ error: 'Entrenador no encontrado' }, { status: 404 })
    }

    if (!coachProfile.isAvailable) {
      return NextResponse.json({ error: 'El entrenador no esta disponible' }, { status: 400 })
    }

    if (coachProfile.verificationStatus !== 'VERIFIED') {
      return NextResponse.json({ error: 'El entrenador no esta verificado' }, { status: 400 })
    }

    const existing = await prisma.coachStudent.findFirst({
      where: {
        coachId: coachProfile.id,
        studentId: playerProfile.id,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Ya tienes una relacion con este entrenador' }, { status: 400 })
    }

    const relation = await prisma.coachStudent.create({
      data: {
        coachId: coachProfile.id,
        studentId: playerProfile.id,
        status: 'PENDING_REQUEST',
      },
    })

    const playerName = playerProfile.displayName || playerProfile.user.name || 'Un jugador'

    createNotification({
      userId: coachProfile.userId,
      type: 'COACH_REQUEST_RECEIVED',
      title: 'Nueva solicitud de entrenamiento',
      body: `${playerName} quiere entrenar contigo`,
      referenceId: relation.id,
      referenceType: 'coach_student',
    }).catch((e) => logger.error('Failed to create coach request notification', e))

    return NextResponse.json(relation, { status: 201 })
  } catch (error) {
    logger.error('Request coach error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
