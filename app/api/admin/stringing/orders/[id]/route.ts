import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { StringingOrderStatus } from '@prisma/client'
import { STRINGING_ORDER_TRANSITIONS, isValidTransition } from '@/lib/order-transitions'

const updateStringingOrderSchema = z.object({
  status: z.nativeEnum(StringingOrderStatus).optional(),
  internalNotes: z.string().optional(),
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

    const order = await prisma.stringingOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        workshop: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error al obtener orden de encordado:', error)
    return NextResponse.json({ error: 'Error al obtener orden de encordado' }, { status: 500 })
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
    const body = await request.json()
    const parsed = updateStringingOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.stringingOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    if (parsed.data.internalNotes !== undefined) {
      data.internalNotes = parsed.data.internalNotes
    }

    if (parsed.data.status) {
      // Validate state transition
      if (!isValidTransition(STRINGING_ORDER_TRANSITIONS, existing.status, parsed.data.status)) {
        return NextResponse.json(
          { error: `Transicion de estado no valida: ${existing.status} -> ${parsed.data.status}` },
          { status: 400 }
        )
      }

      data.status = parsed.data.status

      const statusTimestamps: Record<string, string> = {
        CONFIRMED: 'confirmedAt',
        RECEIVED_AT_WORKSHOP: 'receivedAt',
        STRINGING_COMPLETED: 'completedAt',
        DELIVERED: 'deliveredAt',
        STRINGING_CANCELLED: 'cancelledAt',
      }

      const timestampField = statusTimestamps[parsed.data.status]
      if (timestampField) {
        data[timestampField] = new Date()
      }
    }

    const order = await prisma.stringingOrder.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        workshop: { select: { name: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error al actualizar orden de encordado:', error)
    return NextResponse.json({ error: 'Error al actualizar orden de encordado' }, { status: 500 })
  }
}
