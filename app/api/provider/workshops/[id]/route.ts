import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const updateWorkshopSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  city: z.string().optional(),
  phone: z.string().nullable().optional(),
  operatingHours: z.record(z.string(), z.string()).optional(),
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
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        _count: { select: { stringingOrders: true } },
      },
    })

    if (!workshop) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }

    if (workshop.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    return NextResponse.json(workshop)
  } catch (error) {
    logger.error('Error al obtener taller:', error)
    return NextResponse.json({ error: 'Error al obtener taller' }, { status: 500 })
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
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const body = await request.json()
    const parsed = updateWorkshopSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.workshop.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(workshop)
  } catch (error) {
    logger.error('Error al actualizar taller:', error)
    return NextResponse.json({ error: 'Error al actualizar taller' }, { status: 500 })
  }
}
