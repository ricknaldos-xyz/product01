import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { generateGoalRoadmap } from '@/lib/goals/roadmap'
import { GoalType, GoalStatus, SkillTier } from '@prisma/client'
import { getUserSubscription, checkActiveGoalsLimit } from '@/lib/subscription'
import { goalLimiter } from '@/lib/rate-limit'
import { sanitizeZodError } from '@/lib/validation'

const TIER_LABELS: Record<string, string> = {
  QUINTA_B: '5ta B',
  QUINTA_A: '5ta A',
  CUARTA_B: '4ta B',
  CUARTA_A: '4ta A',
  TERCERA_B: '3ra B',
  TERCERA_A: '3ra A',
  SEGUNDA_B: '2da B',
  SEGUNDA_A: '2da A',
  PRIMERA_B: '1ra B',
  PRIMERA_A: '1ra A',
}

const createGoalSchema = z.object({
  type: z.nativeEnum(GoalType),
  techniqueIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una técnica'),
  targetScore: z.number().min(0).max(10).optional(),
  targetTier: z.nativeEnum(SkillTier).optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'SCORE_TARGET' && data.targetScore == null) return false
    return true
  },
  { message: 'La puntuación objetivo es requerida para este tipo de meta', path: ['targetScore'] }
).refine(
  (data) => {
    if (data.type === 'TIER_TARGET' && data.targetTier == null) return false
    return true
  },
  { message: 'El nivel objetivo es requerido para este tipo de meta', path: ['targetTier'] }
)

function generateTitle(
  type: GoalType,
  techniques: { name: string }[],
  targetScore?: number,
  targetTier?: SkillTier
): string {
  switch (type) {
    case 'TECHNIQUE': {
      if (techniques.length === 1) {
        return `Mejorar ${techniques[0].name}`
      }
      const last = techniques[techniques.length - 1].name
      const rest = techniques.slice(0, -1).map((t) => t.name).join(', ')
      return `Mejorar ${rest} y ${last}`
    }
    case 'SCORE_TARGET':
      return `Alcanzar ${targetScore}/10 en ${techniques[0].name}`
    case 'TIER_TARGET':
      return `Llegar a ${TIER_LABELS[targetTier ?? ''] ?? targetTier}`
    default:
      return 'Nuevo objetivo'
  }
}

// POST - Create a new improvement goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await goalLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = createGoalSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: sanitizeZodError(validated.error) },
        { status: 400 }
      )
    }

    const { type, techniqueIds, targetScore, targetTier, description } = validated.data

    // Check subscription limit for active goals
    const subscription = await getUserSubscription(session.user.id)
    const goalsCheck = await checkActiveGoalsLimit(session.user.id, subscription)
    if (!goalsCheck.allowed) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${goalsCheck.limit} metas activas. Mejora tu plan para crear más.` },
        { status: 403 }
      )
    }

    // Validate that all techniques exist
    const techniques = await prisma.technique.findMany({
      where: { id: { in: techniqueIds } },
      include: { sport: true },
    })

    if (techniques.length !== techniqueIds.length) {
      return NextResponse.json(
        { error: 'Una o más técnicas no fueron encontradas' },
        { status: 400 }
      )
    }

    // Auto-generate title
    const title = generateTitle(type, techniques, targetScore, targetTier)

    // Look up existing TechniqueScore for baseline
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    let baselineScore: number | null = null
    if (profile) {
      const techniqueScores = await prisma.techniqueScore.findMany({
        where: {
          profileId: profile.id,
          techniqueId: { in: techniqueIds },
        },
        select: { averageScore: true },
      })

      if (techniqueScores.length > 0) {
        const avg =
          techniqueScores.reduce((sum, ts) => sum + ts.averageScore, 0) /
          techniqueScores.length
        baselineScore = Math.round((avg / 10) * 100) / 100
      }
    }

    // Generate roadmap
    const techniquesForRoadmap = techniques.map((t) => ({
      name: t.name,
      slug: t.slug,
      sport: { name: t.sport.name, slug: t.sport.slug },
    }))

    const roadmap = await generateGoalRoadmap(
      { type, title, description: description ?? null, targetScore: targetScore ?? null, targetTier: targetTier ?? null, baselineScore },
      techniquesForRoadmap
    )

    // Create goal with techniques in a transaction
    const goal = await prisma.$transaction(async (tx) => {
      const created = await tx.improvementGoal.create({
        data: {
          userId: session.user.id,
          type,
          title,
          description,
          targetScore: targetScore ?? null,
          targetTier: targetTier ?? null,
          baselineScore,
          currentScore: baselineScore,
          roadmap: roadmap as object,
          techniques: {
            create: techniqueIds.map((techniqueId) => ({
              techniqueId,
            })),
          },
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

      return created
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    logger.error('Create goal error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - List goals for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const where = {
      userId: session.user.id,
      ...(status ? { status: status as GoalStatus } : {}),
    }

    const [goals, total] = await Promise.all([
      prisma.improvementGoal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
          _count: {
            select: {
              analyses: true,
              trainingPlans: true,
            },
          },
        },
      }),
      prisma.improvementGoal.count({ where }),
    ])

    return NextResponse.json({
      goals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error('List goals error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
