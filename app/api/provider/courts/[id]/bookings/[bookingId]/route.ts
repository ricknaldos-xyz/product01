import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'

const actionSchema = z.object({
  action: z.enum(['confirm', 'reject']),
  confirmationNote: z.string().optional(),
  totalCents: z.number().int().min(0).optional(),
})

// PATCH - Confirm or reject a booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!session.user.isProvider) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id, bookingId } = await params

    // Verify court ownership
    const court = await prisma.court.findUnique({ where: { id } })
    if (!court) {
      return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
    }
    if (court.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verify booking belongs to this court
    const booking = await prisma.courtBooking.findUnique({
      where: { id: bookingId },
      include: { user: { select: { id: true, name: true } } },
    })
    if (!booking || booking.courtId !== id) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Solo se pueden gestionar reservas pendientes' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { action, confirmationNote, totalCents } = parsed.data

    if (action === 'confirm') {
      // Calculate totalCents from hourlyRate if not provided
      let finalTotalCents = totalCents
      if (finalTotalCents === undefined) {
        // Parse start/end times to compute duration in hours
        const [startH, startM] = booking.startTime.split(':').map(Number)
        const [endH, endM] = booking.endTime.split(':').map(Number)
        const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60
        finalTotalCents = Math.round((court.hourlyRate ?? 0) * durationHours * 100)
      }

      const updated = await prisma.courtBooking.update({
        where: { id: bookingId },
        data: {
          status: 'PENDING_PAYMENT',
          confirmationNote: confirmationNote || null,
          confirmedAt: new Date(),
          totalCents: finalTotalCents,
        },
      })

      await createNotification({
        userId: booking.userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Reserva confirmada',
        body: `Tu reserva en ${court.name} para el ${booking.date.toISOString().split('T')[0]} ha sido confirmada.`,
        referenceId: bookingId,
        referenceType: 'CourtBooking',
      })

      return NextResponse.json(updated)
    } else {
      // reject
      const updated = await prisma.courtBooking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          confirmationNote: confirmationNote || null,
          rejectedAt: new Date(),
        },
      })

      await createNotification({
        userId: booking.userId,
        type: 'BOOKING_REJECTED',
        title: 'Reserva rechazada',
        body: `Tu reserva en ${court.name} para el ${booking.date.toISOString().split('T')[0]} ha sido rechazada.${confirmationNote ? ` Motivo: ${confirmationNote}` : ''}`,
        referenceId: bookingId,
        referenceType: 'CourtBooking',
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    logger.error('Provider booking action error:', error)
    return NextResponse.json({ error: 'Error al procesar la reserva' }, { status: 500 })
  }
}
