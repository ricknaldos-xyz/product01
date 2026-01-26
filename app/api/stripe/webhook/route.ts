import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Helper to get current_period_end from subscription items
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const firstItem = subscription.items?.data?.[0]
  if (firstItem?.current_period_end) {
    return new Date(firstItem.current_period_end * 1000)
  }
  return null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id,
            { expand: ['items.data'] }
          )

          const userId = session.metadata?.userId
          const plan = session.metadata?.plan as 'PRO' | 'ELITE' | undefined

          if (userId && plan) {
            const periodEnd = getSubscriptionPeriodEnd(subscription)

            await prisma.user.update({
              where: { id: userId },
              data: {
                subscription: plan,
                stripeSubscriptionId: subscription.id,
                stripeCurrentPeriodEnd: periodEnd,
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const customerResponse = await stripe.customers.retrieve(
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id
        )
        const customer = customerResponse as Stripe.Customer | Stripe.DeletedCustomer

        if (customer && !customer.deleted && 'metadata' in customer && customer.metadata?.userId) {
          // Get plan from price
          const priceId = subscription.items.data[0]?.price.id
          let plan: 'FREE' | 'PRO' | 'ELITE' = 'FREE'

          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'PRO'
          } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
            plan = 'ELITE'
          }

          const periodEnd = getSubscriptionPeriodEnd(subscription)

          await prisma.user.update({
            where: { id: customer.metadata.userId },
            data: {
              subscription: plan,
              stripeCurrentPeriodEnd: periodEnd,
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const customerResponse = await stripe.customers.retrieve(
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id
        )
        const customer = customerResponse as Stripe.Customer | Stripe.DeletedCustomer

        if (customer && !customer.deleted && 'metadata' in customer && customer.metadata?.userId) {
          await prisma.user.update({
            where: { id: customer.metadata.userId },
            data: {
              subscription: 'FREE',
              stripeSubscriptionId: null,
              stripeCurrentPeriodEnd: null,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
