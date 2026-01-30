import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const abandonSchema = z.object({
  status: z.literal('ABANDONED'),
})

// GET - Get goal detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const goal = await prisma.improvementGoal.findUnique({
      where: { id },
      include: {
        techniques: {
          include: {
            technique: {
              select: {
                id: true,
                name: true,
                slug: true,
                sport: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
        analyses: {
          include: {
            analysis: {
              select: {
                id: true,
                overallScore: true,
                createdAt: true,
                technique: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { analysis: { createdAt: 'asc' } },
        },
        trainingPlans: {
          include: {
            trainingPlan: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 })
    }

    if (goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    logger.error('Get goal error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Abandon a goal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = abandonSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const goal = await prisma.improvementGoal.findUnique({
      where: { id },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta no encontrada' }, { status: 404 })
    }

    if (goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (goal.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Solo se pueden abandonar metas activas' },
        { status: 400 }
      )
    }

    const updated = await prisma.improvementGoal.update({
      where: { id },
      data: {
        status: 'ABANDONED',
        abandonedAt: new Date(),
      },
      include: {
        techniques: {
          include: {
            technique: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Abandon goal error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
