import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
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

    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, slug: true, thumbnailUrl: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
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
    const parsed = updateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.shopOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const { status } = parsed.data
    const timestamps: Record<string, unknown> = {}

    if (status === 'SHIPPED') {
      timestamps.shippedAt = new Date()
    } else if (status === 'DELIVERED') {
      timestamps.deliveredAt = new Date()
    } else if (status === 'CANCELLED') {
      timestamps.cancelledAt = new Date()
    }

    const order = await prisma.shopOrder.update({
      where: { id },
      data: {
        status,
        ...timestamps,
      },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}
