import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError } from '@/lib/validation'

const createTemplateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minusculas, numeros y guiones'),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  instructions: z.string().min(1),
  category: z.string().min(1).max(100),
  targetAreas: z.array(z.string().min(1)).min(1),
  sportSlugs: z.array(z.string().min(1)).min(1),
  defaultSets: z.number().int().positive().nullable().optional(),
  defaultReps: z.number().int().positive().nullable().optional(),
  defaultDurationMins: z.number().int().positive().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    const sport = searchParams.get('sport')
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}

    if (sport) {
      where.sportSlugs = { has: sport }
    }
    if (category) {
      where.category = category
    }
    if (active !== null && active !== undefined && active !== '') {
      where.isActive = active === 'true'
    }

    const [templates, total] = await Promise.all([
      prisma.exerciseTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.exerciseTemplate.count({ where }),
    ])

    return NextResponse.json({
      templates,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error('Admin exercise templates list error:', error)
    return NextResponse.json({ error: 'Error al listar plantillas de ejercicios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.exerciseTemplate.findUnique({
      where: { slug: parsed.data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Ya existe una plantilla con ese slug' }, { status: 409 })
    }

    const template = await prisma.exerciseTemplate.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        instructions: parsed.data.instructions,
        category: parsed.data.category,
        targetAreas: parsed.data.targetAreas,
        sportSlugs: parsed.data.sportSlugs,
        defaultSets: parsed.data.defaultSets ?? null,
        defaultReps: parsed.data.defaultReps ?? null,
        defaultDurationMins: parsed.data.defaultDurationMins ?? null,
        videoUrl: parsed.data.videoUrl ?? null,
        imageUrls: parsed.data.imageUrls ?? [],
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    logger.error('Admin exercise template create error:', error)
    return NextResponse.json({ error: 'Error al crear plantilla de ejercicio' }, { status: 500 })
  }
}
