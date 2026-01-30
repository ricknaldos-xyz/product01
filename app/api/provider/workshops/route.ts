import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createWorkshopSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La direccion es requerida'),
  district: z.string().min(1, 'El distrito es requerido'),
  city: z.string().default('Lima'),
  phone: z.string().optional(),
  operatingHours: z.any().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = { ownerId: session.user.id }

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { stringingOrders: true } },
        },
      }),
      prisma.workshop.count({ where }),
    ])

    return NextResponse.json({
      workshops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Error al listar talleres del proveedor:', error)
    return NextResponse.json({ error: 'Error al listar talleres' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider || !session.user.providerTypes?.includes('STRINGING')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createWorkshopSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const workshop = await prisma.workshop.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        district: parsed.data.district,
        city: parsed.data.city,
        phone: parsed.data.phone,
        operatingHours: parsed.data.operatingHours,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    logger.error('Error al crear taller:', error)
    return NextResponse.json({ error: 'Error al crear taller' }, { status: 500 })
  }
}
