import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProgressSchema = z.object({
  trainingPlanId: z.string(),
  exerciseId: z.string(),
  date: z.string(),
  completed: z.boolean(),
  setsCompleted: z.number().optional(),
  repsCompleted: z.number().optional(),
  durationMins: z.number().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createProgressSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      trainingPlanId,
      exerciseId,
      date,
      completed,
      setsCompleted,
      repsCompleted,
      durationMins,
      difficulty,
      notes,
    } = validated.data

    // Verify training plan belongs to user
    const plan = await prisma.trainingPlan.findFirst({
      where: { id: trainingPlanId, userId: session.user.id },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan de entrenamiento no encontrado' },
        { status: 404 }
      )
    }

    // Upsert progress log
    const progressLog = await prisma.progressLog.upsert({
      where: {
        trainingPlanId_exerciseId_date: {
          trainingPlanId,
          exerciseId,
          date: new Date(date),
        },
      },
      update: {
        completed,
        setsCompleted,
        repsCompleted,
        durationMins,
        difficulty,
        notes,
      },
      create: {
        userId: session.user.id,
        trainingPlanId,
        exerciseId,
        date: new Date(date),
        completed,
        setsCompleted,
        repsCompleted,
        durationMins,
        difficulty,
        notes,
      },
    })

    // Check if all exercises are completed to update plan status
    const totalExercises = await prisma.exercise.count({
      where: { trainingPlanId },
    })

    const completedExercises = await prisma.progressLog.count({
      where: {
        trainingPlanId,
        completed: true,
      },
    })

    // If all exercises completed, mark plan as completed
    if (completedExercises >= totalExercises && plan.status === 'ACTIVE') {
      await prisma.trainingPlan.update({
        where: { id: trainingPlanId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json(progressLog, { status: 201 })
  } catch (error) {
    console.error('Create progress error:', error)
    return NextResponse.json(
      { error: 'Error al guardar progreso' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const trainingPlanId = searchParams.get('trainingPlanId')

    if (!trainingPlanId) {
      return NextResponse.json(
        { error: 'Se requiere trainingPlanId' },
        { status: 400 }
      )
    }

    const progressLogs = await prisma.progressLog.findMany({
      where: {
        userId: session.user.id,
        trainingPlanId,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(progressLogs)
  } catch (error) {
    console.error('Fetch progress error:', error)
    return NextResponse.json(
      { error: 'Error al obtener progreso' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const progressId = searchParams.get('id')

    if (!progressId) {
      return NextResponse.json(
        { error: 'Se requiere id' },
        { status: 400 }
      )
    }

    // Verify progress belongs to user
    const progress = await prisma.progressLog.findFirst({
      where: { id: progressId, userId: session.user.id },
    })

    if (!progress) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    await prisma.progressLog.delete({
      where: { id: progressId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete progress error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar progreso' },
      { status: 500 }
    )
  }
}
