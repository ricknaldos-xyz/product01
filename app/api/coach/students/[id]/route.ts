import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateStudentSchema = z.object({
  status: z.enum(['PENDING_INVITE', 'ACTIVE', 'PAUSED', 'ENDED']).optional(),
  canViewAnalyses: z.boolean().optional(),
  canAssignPlans: z.boolean().optional(),
})

// PATCH - Update a coach-student relationship
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: coachStudentId } = await params

    const body = await request.json()
    const validated = updateStudentSchema.safeParse(body)

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
      where: { id: coachStudentId },
    })

    if (!coachStudent || coachStudent.coachId !== coachProfile.id) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { ...validated.data }

    if (validated.data.status === 'ACTIVE' && !coachStudent.startedAt) {
      updateData.startedAt = new Date()
    }

    if (validated.data.status === 'ENDED') {
      updateData.endedAt = new Date()
    }

    const updated = await prisma.coachStudent.update({
      where: { id: coachStudentId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Update coach student error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
