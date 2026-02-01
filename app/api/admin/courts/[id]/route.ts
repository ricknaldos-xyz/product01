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
  ownerId: z.string().nullable().optional(),
})

// PATCH - Update court (admin)
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

    const court = await prisma.court.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(court)
  } catch (error) {
    logger.error('Update court error:', error)
    return NextResponse.json({ error: 'Error al actualizar cancha' }, { status: 500 })
  }
}

// DELETE - Delete court (admin)
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

    const existing = await prisma.court.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }

    await prisma.court.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cancha eliminada correctamente' })
  } catch (error) {
    logger.error('Delete court error:', error)
    return NextResponse.json({ error: 'Error al eliminar cancha' }, { status: 500 })
  }
}
