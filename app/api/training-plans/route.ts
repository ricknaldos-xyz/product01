import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateTrainingPlan } from '@/lib/training/generator'
import { linkTrainingPlanToGoal } from '@/lib/goals/progress'
import { getUserSubscription, checkActivePlansLimit } from '@/lib/subscription'
import { z } from 'zod'

const createPlanSchema = z.object({
  analysisId: z.string(),
  durationWeeks: z.number().min(1).max(12).optional().default(4),
  goalId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createPlanSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check subscription limit for active training plans
    const subscription = await getUserSubscription(session.user.id)
    const planCheck = await checkActivePlansLimit(session.user.id, subscription)
    if (!planCheck.allowed) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${planCheck.limit} plan(es) de entrenamiento activo(s). Mejora tu plan para crear más.` },
        { status: 403 }
      )
    }

    const plan = await generateTrainingPlan({
      analysisId: validated.data.analysisId,
      userId: session.user.id,
      durationWeeks: validated.data.durationWeeks,
    })

    // Link to goal if provided (non-blocking)
    if (validated.data.goalId && plan?.id) {
      linkTrainingPlanToGoal(session.user.id, plan.id, validated.data.goalId).catch((error) => {
        logger.error('Failed to link training plan to goal:', error)
      })
    }

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    logger.error('Create training plan error:', error)
    return NextResponse.json(
      { error: 'Error al crear plan' },
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

    const plans = await prisma.trainingPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        analysis: {
          include: {
            technique: {
              include: { sport: true },
            },
          },
        },
        _count: {
          select: { exercises: true, progressLogs: true },
        },
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    logger.error('Fetch training plans error:', error)
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    )
  }
}
