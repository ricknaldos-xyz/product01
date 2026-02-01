import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const updateTemplateSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minusculas, numeros y guiones').optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  targetAreas: z.array(z.string().min(1)).min(1).optional(),
  sportSlugs: z.array(z.string().min(1)).min(1).optional(),
  defaultSets: z.number().int().positive().nullable().optional(),
  defaultReps: z.number().int().positive().nullable().optional(),
  defaultDurationMins: z.number().int().positive().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const template = await prisma.exerciseTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    logger.error('Admin exercise template get error:', error)
    return NextResponse.json({ error: 'Error al obtener plantilla' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const existing = await prisma.exerciseTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await prisma.exerciseTemplate.findUnique({
        where: { slug: parsed.data.slug },
      })
      if (slugTaken) {
        return NextResponse.json({ error: 'Ya existe una plantilla con ese slug' }, { status: 409 })
      }
    }

    const template = await prisma.exerciseTemplate.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(template)
  } catch (error) {
    logger.error('Admin exercise template update error:', error)
    return NextResponse.json({ error: 'Error al actualizar plantilla' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const existing = await prisma.exerciseTemplate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    await prisma.exerciseTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Admin exercise template delete error:', error)
    return NextResponse.json({ error: 'Error al eliminar plantilla' }, { status: 500 })
  }
}
