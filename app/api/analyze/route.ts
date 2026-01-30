import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createAnalysisSchema = z.object({
  techniqueId: z.string(),
  variantId: z.string().optional(),
  mediaItems: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(['VIDEO', 'IMAGE']),
      filename: z.string(),
      size: z.number(),
      angle: z.string().optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createAnalysisSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { techniqueId, variantId, mediaItems } = validated.data

    // Verify technique exists
    const technique = await prisma.technique.findUnique({
      where: { id: techniqueId },
    })

    if (!technique) {
      return NextResponse.json(
        { error: 'Tecnica no encontrada' },
        { status: 404 }
      )
    }

    // Create analysis with media items
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        techniqueId,
        variantId: variantId || null,
        status: 'PENDING',
        mediaItems: {
          create: mediaItems.map((item) => ({
            type: item.type,
            url: item.url,
            filename: item.filename,
            fileSize: item.size,
            angle: item.angle,
          })),
        },
      },
      include: {
        technique: {
          include: { sport: true },
        },
        variant: true,
        mediaItems: true,
      },
    })

    return NextResponse.json(analysis, { status: 201 })
  } catch (error) {
    logger.error('Create analysis error:', error)
    return NextResponse.json(
      { error: 'Error al crear analisis' },
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
    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where = { userId: session.user.id }
    const include = {
      technique: {
        include: { sport: true },
      },
      variant: true,
      _count: {
        select: { issues: true },
      },
    }

    if (!paginated) {
      const analyses = await prisma.analysis.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      })
      return NextResponse.json(analyses)
    }

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.analysis.count({ where }),
    ])

    return NextResponse.json({
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Fetch analyses error:', error)
    return NextResponse.json(
      { error: 'Error al obtener analisis' },
      { status: 500 }
    )
  }
}
