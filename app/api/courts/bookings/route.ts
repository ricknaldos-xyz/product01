import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

// GET - List user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as BookingStatus | null
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId: session.user.id }

    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.courtBooking.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          court: {
            select: {
              name: true,
              address: true,
              district: true,
              surface: true,
            },
          },
        },
      }),
      prisma.courtBooking.count({ where }),
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List bookings error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Cancel a booking
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId es requerido' }, { status: 400 })
    }

    const booking = await prisma.courtBooking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar reservas pendientes o confirmadas' },
        { status: 400 }
      )
    }

    const updated = await prisma.courtBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
