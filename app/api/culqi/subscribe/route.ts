import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getCulqiClient, CULQI_PLAN_IDS } from '@/lib/culqi'
import { PLANS } from '@/lib/plans'
import { z } from 'zod'

const subscribeSchema = z.object({
  plan: z.enum(['PRO', 'ELITE']),
  tokenId: z.string().min(1, 'Token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = subscribeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { plan, tokenId } = parsed.data

    const selectedPlan = PLANS[plan]
    const planId = CULQI_PLAN_IDS[plan]
    if (!planId) {
      return NextResponse.json({ error: 'Plan no tiene ID de Culqi configurado' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        culqiCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const culqi = getCulqiClient()
    let customerId = user.culqiCustomerId

    // Step 1: Create or retrieve Culqi customer
    if (!customerId) {
      try {
        const nameParts = (user.name || 'Usuario').split(' ')
        const firstName = nameParts[0] || 'Usuario'
        const lastName = nameParts.slice(1).join(' ') || 'Sin Apellido'

        const customer = await culqi.customers.createCustomer({
          first_name: firstName,
          last_name: lastName,
          email: user.email!,
          address: 'Lima',
          address_city: 'Lima',
          country_code: 'PE',
          phone_number: '999999999',
        })

        customerId = customer.id
      } catch (customerError: unknown) {
        // If customer already exists, try to find the existing one
        const errorMessage = customerError instanceof Error ? customerError.message : String(customerError)
        if (
          errorMessage.toLowerCase().includes('already') ||
          errorMessage.toLowerCase().includes('existe') ||
          errorMessage.toLowerCase().includes('duplicate')
        ) {
          try {
            const customers = await culqi.customers.getCustomers({
              email: user.email!,
            })
            const existing = customers?.data?.[0]
            if (existing) {
              customerId = existing.id
            } else {
              return NextResponse.json(
                { error: 'No se pudo recuperar el cliente existente' },
                { status: 500 }
              )
            }
          } catch (findError) {
            logger.error('Error finding existing Culqi customer:', findError)
            return NextResponse.json(
              { error: 'Error al buscar cliente existente' },
              { status: 500 }
            )
          }
        } else {
          logger.error('Error creating Culqi customer:', customerError)
          return NextResponse.json(
            { error: 'Error al crear cliente en Culqi' },
            { status: 500 }
          )
        }
      }
    }

    // Step 2: Create card from token
    let cardId: string
    try {
      const card = await culqi.cards.createCard({
        customer_id: customerId!,
        token_id: tokenId,
      })
      cardId = card.id
    } catch (cardError) {
      logger.error('Error creating Culqi card:', cardError)
      return NextResponse.json(
        { error: 'Error al registrar tarjeta' },
        { status: 500 }
      )
    }

    // Step 3: Create subscription
    let subscriptionId: string
    try {
      const subscription = await culqi.subscriptions.createSubscription({
        card_id: cardId,
        plan_id: planId,
      })
      subscriptionId = subscription.id
    } catch (subscriptionError) {
      logger.error('Error creating Culqi subscription:', subscriptionError)
      return NextResponse.json(
        { error: 'Error al crear suscripcion' },
        { status: 500 }
      )
    }

    // Step 4: Update user in database
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscription: plan,
        culqiCustomerId: customerId,
        culqiSubscriptionId: subscriptionId,
        culqiCurrentPeriodEnd: periodEnd,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
