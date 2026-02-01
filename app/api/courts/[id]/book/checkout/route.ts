import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { checkoutLimiter } from '@/lib/rate-limit'
import { getCulqiClient } from '@/lib/culqi'
import { z } from 'zod'
import { sanitizeZodError } from '@/lib/validation'

const checkoutSchema = z.object({
  bookingId: z.string(),
  tokenId: z.string(),
})

// POST - Pay for a confirmed booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await checkoutLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const { id: courtId } = await params
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { bookingId, tokenId } = parsed.data

    const booking = await prisma.courtBooking.findUnique({
      where: { id: bookingId },
      include: {
        court: { select: { id: true, name: true, ownerId: true } },
      },
    })

    if (!booking || booking.courtId !== courtId) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Esta reserva no esta pendiente de pago' },
        { status: 400 }
      )
    }

    if (!booking.totalCents || booking.totalCents <= 0) {
      return NextResponse.json(
        { error: 'El monto de la reserva no es valido' },
        { status: 400 }
      )
    }

    // Create Culqi charge
    try {
      const culqi = getCulqiClient()
      const charge = await culqi.charges.createCharge({
        amount: String(booking.totalCents),
        currency_code: 'PEN',
        email: session.user.email!,
        source_id: tokenId,
        metadata: {
          type: 'court_booking',
          bookingId: booking.id,
          courtId: booking.courtId,
        },
      })

      await prisma.courtBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          culqiChargeId: charge.id,
          paidAt: new Date(),
        },
      })

      // Notify court owner that payment was received
      if (booking.court.ownerId) {
        await createNotification({
          userId: booking.court.ownerId,
          type: 'BOOKING_CONFIRMED',
          title: 'Pago de reserva recibido',
          body: `El pago para la reserva en ${booking.court.name} el ${booking.date.toISOString().split('T')[0]} de ${booking.startTime} a ${booking.endTime} ha sido recibido.`,
          referenceId: bookingId,
          referenceType: 'court_booking',
        }).catch((err) => logger.error('Failed to create payment notification:', err))
      }

      return NextResponse.json({ success: true, bookingId: booking.id })
    } catch (chargeError) {
      logger.error('Culqi charge failed for court booking:', chargeError)
      return NextResponse.json(
        { error: 'Error al procesar el pago. Intenta de nuevo.' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Court booking checkout error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
