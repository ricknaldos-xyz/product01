import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'
import { CourtSurface, CourtType } from '@prisma/client'

const updateCourtSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  address: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  surface: z.nativeEnum(CourtSurface).optional(),
  courtType: z.nativeEnum(CourtType).optional(),
  hourlyRate: z.number().min(0).optional(),
  currency: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  operatingHours: z.record(z.string(), z.string()).optional(),
})

// GET - Get a single court owned by current user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!court) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }
    if (court.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    return NextResponse.json(court)
  } catch (error) {
    logger.error('Provider get court error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Update court (verify ownership)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const body = await request.json()
    const parsed = updateCourtSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.court.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const court = await prisma.court.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(court)
  } catch (error) {
    logger.error('Provider update court error:', error)
    return NextResponse.json({ error: 'Error al actualizar cancha' }, { status: 500 })
  }
}

// DELETE - Soft-delete court (set isActive=false, verify ownership)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const existing = await prisma.court.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    await prisma.court.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Cancha desactivada correctamente' })
  } catch (error) {
    logger.error('Provider delete court error:', error)
    return NextResponse.json({ error: 'Error al desactivar cancha' }, { status: 500 })
  }
}
