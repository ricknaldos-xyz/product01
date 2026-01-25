import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTrainingPlan } from '@/lib/training/generator'
import { z } from 'zod'

const createPlanSchema = z.object({
  analysisId: z.string(),
  durationWeeks: z.number().min(1).max(12).optional().default(4),
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
        { error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const plan = await generateTrainingPlan({
      analysisId: validated.data.analysisId,
      userId: session.user.id,
      durationWeeks: validated.data.durationWeeks,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Create training plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear plan' },
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
    console.error('Fetch training plans error:', error)
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    )
  }
}
