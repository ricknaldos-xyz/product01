import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'
import { coachInviteLimiter } from '@/lib/rate-limit'
import { sanitizeZodError } from '@/lib/validation'

const inviteSchema = z.object({
  studentUserId: z.string(),
})

// POST - Invite a student
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await coachInviteLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = inviteSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: sanitizeZodError(validated.error) },
        { status: 400 }
      )
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, verificationStatus: true },
    })

    if (!coachProfile) {
      return NextResponse.json({ error: 'No eres entrenador' }, { status: 403 })
    }

    if (coachProfile.verificationStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Tu perfil de entrenador debe estar verificado para invitar alumnos' },
        { status: 403 }
      )
    }

    const studentProfile = await prisma.playerProfile.findUnique({
      where: { userId: validated.data.studentUserId },
      select: { id: true, userId: true },
    })

    if (!studentProfile) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    const relation = await prisma.coachStudent.create({
      data: {
        coachId: coachProfile.id,
        studentId: studentProfile.id,
        status: 'PENDING_INVITE',
      },
    })

    // Notify student
    createNotification({
      userId: studentProfile.userId,
      type: 'COACH_INVITATION',
      title: 'Invitacion de entrenador',
      body: 'Un entrenador quiere trabajar contigo',
      referenceId: relation.id,
      referenceType: 'coach_student',
    }).catch((e) => logger.error('Failed to create coach invitation notification', e))

    return NextResponse.json(relation, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya tienes una relacion con este alumno' }, { status: 400 })
    }
    logger.error('Invite student error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
