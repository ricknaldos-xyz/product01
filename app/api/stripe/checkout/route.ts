import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PLANS } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'ELITE']),
})

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
        { error: 'Plan invalido' },
        { status: 400 }
      )
    }

    const { plan } = validated.data
    const selectedPlan = PLANS[plan]

    if (!selectedPlan.priceId) {
      return NextResponse.json(
        { error: 'Este plan no tiene precio configurado' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      })

      customerId = customer.id

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Error al crear sesion de pago' },
      { status: 500 }
    )
  }
}
