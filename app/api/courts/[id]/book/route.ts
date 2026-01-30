import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const bookingSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha invalida'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora invalido (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora invalido (HH:MM)'),
  notes: z.string().max(500).optional(),
})

// POST - Create a booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: courtId } = await params
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { date, startTime, endTime, notes } = parsed.data

    // Validate startTime < endTime
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'La hora de inicio debe ser anterior a la hora de fin' },
        { status: 400 }
      )
    }

    // Validate date is in the future
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'La fecha debe ser futura' },
        { status: 400 }
      )
    }

    // Validate court exists and is active
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    })

    if (!court || !court.isActive) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }

    // Check for conflicting bookings (same court, same date, overlapping times)
    const conflicting = await prisma.courtBooking.findFirst({
      where: {
        courtId,
        date: bookingDate,
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    })

    if (conflicting) {
      return NextResponse.json(
        { error: 'Ya existe una reserva en ese horario' },
        { status: 409 }
      )
    }

    const booking = await prisma.courtBooking.create({
      data: {
        courtId,
        userId: session.user.id!,
        date: bookingDate,
        startTime,
        endTime,
        status: 'PENDING',
        notes,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    logger.error('Create booking error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
