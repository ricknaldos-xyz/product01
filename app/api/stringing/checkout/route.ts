import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createStringingCheckoutSession } from '@/lib/shop-stripe'

const checkoutSchema = z.object({
  orderId: z.string(),
})

// POST - Create Stripe checkout session for stringing order
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

    const { orderId } = validated.data

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

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      throw new Error('NEXTAUTH_URL or NEXT_PUBLIC_APP_URL must be configured')
    }
    const checkoutSession = await createStringingCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      description: `${order.racketBrand} ${order.racketModel} - ${order.stringName}`,
      totalCents: order.totalCents,
      successUrl: `${baseUrl}/encordado/pedidos/${order.id}`,
      cancelUrl: `${baseUrl}/encordado/pedidos`,
      customerEmail: session.user.email!,
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    console.error('Stringing checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear sesion de pago' },
      { status: 500 }
    )
  }
}
