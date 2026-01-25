import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
        { error: validated.error.errors[0].message },
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
    console.error('Create analysis error:', error)
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

    const analyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        technique: {
          include: { sport: true },
        },
        variant: true,
        _count: {
          select: { issues: true },
        },
      },
    })

    return NextResponse.json(analyses)
  } catch (error) {
    console.error('Fetch analyses error:', error)
    return NextResponse.json(
      { error: 'Error al obtener analisis' },
      { status: 500 }
    )
  }
}
