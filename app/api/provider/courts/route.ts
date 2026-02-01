import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError } from '@/lib/validation'
import { CourtSurface, CourtType } from '@prisma/client'

const createCourtSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  address: z.string().min(1, 'La direccion es requerida'),
  district: z.string().min(1, 'El distrito es requerido'),
  city: z.string().optional().default('Lima'),
  country: z.string().optional().default('PE'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  imageUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  surface: z.nativeEnum(CourtSurface),
  courtType: z.nativeEnum(CourtType),
  hourlyRate: z.number().min(0, 'La tarifa debe ser mayor o igual a 0'),
  currency: z.string().optional().default('PEN'),
  amenities: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  operatingHours: z.record(z.string(), z.string()).optional(),
})

// GET - List courts owned by current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where = { ownerId: session.user.id }

    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.court.count({ where }),
    ])

    return NextResponse.json({
      courts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Provider list courts error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create a new court owned by current user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createCourtSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const court = await prisma.court.create({
      data: {
        ...parsed.data,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(court, { status: 201 })
  } catch (error) {
    logger.error('Provider create court error:', error)
    return NextResponse.json({ error: 'Error al crear cancha' }, { status: 500 })
  }
}
