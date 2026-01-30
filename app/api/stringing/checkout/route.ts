import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { getCulqiClient } from '@/lib/culqi'

const checkoutSchema = z.object({
  orderId: z.string(),
  tokenId: z.string(),
})

// POST - Process payment for stringing order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = checkoutSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { orderId, tokenId } = validated.data

    const order = await prisma.stringingOrder.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Este pedido ya fue pagado o no esta pendiente de pago' },
        { status: 400 }
      )
    }

    // Create Culqi charge
    try {
      const culqi = getCulqiClient()
      const charge = await culqi.charges.createCharge({
        amount: String(order.totalCents),
        currency_code: 'PEN',
        email: session.user.email!,
        source_id: tokenId,
        metadata: {
          type: 'stringing_order',
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      })

      await prisma.stringingOrder.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          culqiChargeId: charge.id,
          paidAt: new Date(),
          confirmedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, orderId: order.id })
    } catch (chargeError) {
      logger.error('Culqi charge failed:', chargeError)
      return NextResponse.json(
        { error: 'Error al procesar el pago. Intenta de nuevo.' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Stringing checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear sesion de pago' },
      { status: 500 }
    )
  }
}
