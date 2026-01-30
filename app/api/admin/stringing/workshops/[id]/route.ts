import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateWorkshopSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  city: z.string().optional(),
  phone: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  isPartner: z.boolean().optional(),
  isActive: z.boolean().optional(),
  operatingHours: z.any().optional(),
})

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
    const body = await request.json()
    const parsed = updateWorkshopSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.workshop.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
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

    const existing = await prisma.workshop.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }

    await prisma.workshop.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Taller desactivado correctamente' })
  } catch (error) {
    logger.error('Error al desactivar taller:', error)
    return NextResponse.json({ error: 'Error al desactivar taller' }, { status: 500 })
  }
}
