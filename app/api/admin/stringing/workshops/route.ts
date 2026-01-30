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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isPartner: z.boolean(),
  operatingHours: z.any().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const workshops = await prisma.workshop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { stringingOrders: true } },
      },
    })

    return NextResponse.json(workshops)
  } catch (error) {
    logger.error('Error al listar talleres:', error)
    return NextResponse.json({ error: 'Error al listar talleres' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
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
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        isPartner: parsed.data.isPartner,
        operatingHours: parsed.data.operatingHours,
      },
    })

    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    logger.error('Error al crear taller:', error)
    return NextResponse.json({ error: 'Error al crear taller' }, { status: 500 })
  }
}
