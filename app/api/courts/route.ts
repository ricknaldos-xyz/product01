import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CourtSurface, CourtType } from '@prisma/client'

// GET - List courts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const surface = searchParams.get('surface') as CourtSurface | null
    const courtType = searchParams.get('courtType') as CourtType | null
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }

    if (city) {
      where.city = city
    }
    if (district) {
      where.district = district
    }
    if (surface) {
      where.surface = surface
    }
    if (courtType) {
      where.courtType = courtType
    }

    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          district: true,
          city: true,
          phone: true,
          whatsapp: true,
          imageUrl: true,
          surface: true,
          courtType: true,
          hourlyRate: true,
          currency: true,
          amenities: true,
          latitude: true,
          longitude: true,
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
    logger.error('List courts error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
