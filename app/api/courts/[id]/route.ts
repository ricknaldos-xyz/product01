import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Court detail (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                date: { gte: new Date() },
              },
            },
          },
        },
      },
    })

    if (!court || !court.isActive) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }

    return NextResponse.json(court)
  } catch (error) {
    logger.error('Get court error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
