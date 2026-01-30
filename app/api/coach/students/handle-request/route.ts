import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'

const handleRequestSchema = z.object({
  coachStudentId: z.string(),
  action: z.enum(['accept', 'decline']),
})

// POST - Coach accepts or declines a student request
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = handleRequestSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!coachProfile) {
      return NextResponse.json({ error: 'No eres entrenador' }, { status: 403 })
    }

    const coachStudent = await prisma.coachStudent.findUnique({
      where: { id: validated.data.coachStudentId },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!coachStudent || coachStudent.coachId !== coachProfile.id) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
    }

    if (coachStudent.status !== 'PENDING_REQUEST') {
      return NextResponse.json({ error: 'Esta solicitud ya fue procesada' }, { status: 400 })
    }

    const isAccept = validated.data.action === 'accept'

    const updated = await prisma.coachStudent.update({
      where: { id: coachStudent.id },
      data: isAccept
        ? { status: 'ACTIVE', startedAt: new Date() }
        : { status: 'ENDED', endedAt: new Date() },
    })

    createNotification({
      userId: coachStudent.student.userId,
      type: isAccept ? 'COACH_REQUEST_ACCEPTED' : 'COACH_REQUEST_DECLINED',
      title: isAccept
        ? 'Solicitud de entrenamiento aceptada'
        : 'Solicitud de entrenamiento declinada',
      body: isAccept
        ? 'Tu solicitud de entrenamiento ha sido aceptada'
        : 'Tu solicitud de entrenamiento ha sido declinada',
      referenceId: updated.id,
      referenceType: 'coach_student',
    }).catch((e) => logger.error('Failed to create handle request notification', e))

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Handle coach request error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
