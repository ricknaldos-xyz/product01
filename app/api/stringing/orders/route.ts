import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  STRINGING_SERVICE_TYPES,
  DELIVERY_MODES,
  generateStringingOrderNumber,
} from '@/lib/stringing'

const createOrderSchema = z.object({
  serviceType: z.enum(['STANDARD', 'EXPRESS']),
  deliveryMode: z.enum(['HOME_PICKUP_DELIVERY', 'WORKSHOP_DROP_PICKUP']),
  racketBrand: z.string().min(1, 'Marca de raqueta requerida'),
  racketModel: z.string().min(1, 'Modelo de raqueta requerido'),
  racketNotes: z.string().max(500).optional(),
  stringName: z.string().min(1, 'Nombre de cuerda requerido'),
  stringProductId: z.string().optional(),
  tensionMain: z.number().min(30).max(80),
  tensionCross: z.number().min(30).max(80).optional(),
  workshopId: z.string().optional(),
  pickupAddress: z.string().optional(),
  pickupDistrict: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryDistrict: z.string().optional(),
  contactPhone: z.string().min(6, 'Telefono de contacto requerido'),
  preferredPickupDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.deliveryMode === 'WORKSHOP_DROP_PICKUP' && !data.workshopId) {
      return false
    }
    return true
  },
  { message: 'Taller requerido para entrega en taller', path: ['workshopId'] }
).refine(
  (data) => {
    if (data.deliveryMode === 'HOME_PICKUP_DELIVERY' && !data.pickupAddress) {
      return false
    }
    return true
  },
  { message: 'Direccion de recojo requerida para servicio a domicilio', path: ['pickupAddress'] }
).refine(
  (data) => {
    if (data.deliveryMode === 'HOME_PICKUP_DELIVERY' && !data.pickupDistrict) {
      return false
    }
    return true
  },
  { message: 'Distrito de recojo requerido para servicio a domicilio', path: ['pickupDistrict'] }
)

// GET - List user's stringing orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where = { userId: session.user.id }
    const include = { workshop: true }

    if (!paginated) {
      const orders = await prisma.stringingOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      })
      return NextResponse.json(orders)
    }

    const [orders, total] = await Promise.all([
      prisma.stringingOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.stringingOrder.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('List stringing orders error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create a new stringing order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createOrderSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    // Calculate pricing
    const servicePriceCents = STRINGING_SERVICE_TYPES[data.serviceType].priceCents
    const pickupFeeCents = DELIVERY_MODES[data.deliveryMode].priceCents

    let stringPriceCents = 0
    if (data.stringProductId) {
      const product = await prisma.product.findUnique({
        where: { id: data.stringProductId },
        select: { priceCents: true },
      })
      if (product) {
        stringPriceCents = product.priceCents
      }
    }

    const totalCents = servicePriceCents + pickupFeeCents + stringPriceCents

    let order
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        order = await prisma.stringingOrder.create({
          data: {
            orderNumber: generateStringingOrderNumber(),
            userId: session.user.id,
            status: 'PENDING_PAYMENT',
            serviceType: data.serviceType,
            deliveryMode: data.deliveryMode,
            racketBrand: data.racketBrand,
            racketModel: data.racketModel,
            racketNotes: data.racketNotes,
            stringName: data.stringName,
            stringProductId: data.stringProductId,
            tensionMain: data.tensionMain,
            tensionCross: data.tensionCross,
            workshopId: data.workshopId,
            pickupAddress: data.pickupAddress,
            pickupDistrict: data.pickupDistrict,
            deliveryAddress: data.deliveryAddress,
            deliveryDistrict: data.deliveryDistrict,
            contactPhone: data.contactPhone,
            preferredPickupDate: data.preferredPickupDate ? new Date(data.preferredPickupDate) : null,
            servicePriceCents,
            pickupFeeCents,
            stringPriceCents,
            totalCents,
          },
        })
        break
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          attempt < 2
        ) {
          continue
        }
        throw e
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Error al generar numero de pedido' }, { status: 500 })
    }

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 })
  } catch (error) {
    logger.error('Create stringing order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
