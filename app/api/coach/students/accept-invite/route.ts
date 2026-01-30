import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const acceptSchema = z.object({
  coachStudentId: z.string(),
})

// POST - Student accepts coach invite
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = acceptSchema.safeParse(body)

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

    const relation = await prisma.coachStudent.findUnique({
      where: { id: validated.data.coachStudentId },
    })

    if (!relation || relation.studentId !== profile.id) {
      return NextResponse.json({ error: 'Invitacion no encontrada' }, { status: 404 })
    }

    if (relation.status !== 'PENDING_INVITE') {
      return NextResponse.json({ error: 'Esta invitacion ya fue procesada' }, { status: 400 })
    }

    const updated = await prisma.coachStudent.update({
      where: { id: relation.id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
