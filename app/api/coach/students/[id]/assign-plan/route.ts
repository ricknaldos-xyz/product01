import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const assignPlanSchema = z.object({
  trainingPlanId: z.string().min(1),
  notes: z.string().max(500).optional(),
})

// POST - Assign a training plan to a student
export async function POST(
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
    const validated = assignPlanSchema.safeParse(body)

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

    if (coachStudent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'La relacion con el alumno no esta activa' },
        { status: 400 }
      )
    }

    const assignedPlan = await prisma.coachAssignedPlan.create({
      data: {
        coachId: coachProfile.id,
        studentId: coachStudent.studentId,
        trainingPlanId: validated.data.trainingPlanId,
        notes: validated.data.notes,
      },
    })

    return NextResponse.json(assignedPlan, { status: 201 })
  } catch (error) {
    logger.error('Assign plan error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
