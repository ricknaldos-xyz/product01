import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { StringingOrderStatus } from '@prisma/client'
import { STRINGING_ORDER_TRANSITIONS, isValidTransition } from '@/lib/order-transitions'
import { createNotification } from '@/lib/notifications'

const updateOrderSchema = z.object({
  status: z.nativeEnum(StringingOrderStatus).optional(),
  internalNotes: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id, orderId } = await params

    // Verify workshop ownership
    const workshop = await prisma.workshop.findUnique({ where: { id } })
    if (!workshop) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }
    if (workshop.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const order = await prisma.stringingOrder.findUnique({
      where: { id: orderId, workshopId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        workshop: { select: { id: true, name: true, address: true, district: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error al obtener orden del taller:', error)
    return NextResponse.json({ error: 'Error al obtener orden' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id, orderId } = await params

    // Verify workshop ownership
    const workshop = await prisma.workshop.findUnique({ where: { id } })
    if (!workshop) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 })
    }
    if (workshop.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.stringingOrder.findUnique({
      where: { id: orderId, workshopId: id },
    })
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
      where: { id: orderId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        workshop: { select: { id: true, name: true } },
      },
    })

    // Send notification to the customer
    if (parsed.data.status) {
      const STATUS_LABELS: Record<string, string> = {
        CONFIRMED: 'Confirmado',
        PICKUP_SCHEDULED: 'Recojo programado',
        RECEIVED_AT_WORKSHOP: 'Recibido en taller',
        IN_PROGRESS: 'En proceso',
        STRINGING_COMPLETED: 'Encordado completado',
        READY_FOR_PICKUP: 'Listo para recoger',
        OUT_FOR_DELIVERY: 'En camino',
        DELIVERED: 'Entregado',
        STRINGING_CANCELLED: 'Cancelado',
      }

      let notificationType: 'STRINGING_COMPLETED' | 'STRINGING_READY_FOR_PICKUP' | 'STRINGING_STATUS_UPDATE'
      let title: string
      let body: string | undefined

      if (parsed.data.status === 'STRINGING_COMPLETED') {
        notificationType = 'STRINGING_COMPLETED'
        title = `Tu encordado ha sido completado`
        body = `La orden ${order.orderNumber} ha sido encordada en ${workshop.name}.`
      } else if (parsed.data.status === 'READY_FOR_PICKUP') {
        notificationType = 'STRINGING_READY_FOR_PICKUP'
        title = `Tu raqueta esta lista para recoger`
        body = `La orden ${order.orderNumber} esta lista en ${workshop.name}.`
      } else {
        notificationType = 'STRINGING_STATUS_UPDATE'
        title = `Actualizacion de tu encordado`
        body = `La orden ${order.orderNumber} cambio a: ${STATUS_LABELS[parsed.data.status] || parsed.data.status}.`
      }

      await createNotification({
        userId: order.userId,
        type: notificationType,
        title,
        body,
        referenceId: order.id,
        referenceType: 'stringing_order',
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    logger.error('Error al actualizar orden del taller:', error)
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
  }
}
