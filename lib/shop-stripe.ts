import { getStripeClient } from '@/lib/stripe'

interface ShopCheckoutParams {
  orderId: string
  orderNumber: string
  lineItems: { name: string; priceCents: number; quantity: number }[]
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  stripeCustomerId?: string
}

interface StringingCheckoutParams {
  orderId: string
  orderNumber: string
  description: string
  totalCents: number
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  stripeCustomerId?: string
}

export async function createShopCheckoutSession(params: ShopCheckoutParams) {
  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'pen',
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: 'pen',
        product_data: { name: item.name },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.stripeCustomerId
      ? { customer: params.stripeCustomerId }
      : params.customerEmail
        ? { customer_email: params.customerEmail }
        : {}),
    metadata: {
      type: 'shop_order',
      orderId: params.orderId,
      orderNumber: params.orderNumber,
    },
  })

  return session
}

export async function createStringingCheckoutSession(
  params: StringingCheckoutParams
) {
  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'pen',
    line_items: [
      {
        price_data: {
          currency: 'pen',
          product_data: {
            name: `Encordado ${params.orderNumber}`,
            description: params.description,
          },
          unit_amount: params.totalCents,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.stripeCustomerId
      ? { customer: params.stripeCustomerId }
      : params.customerEmail
        ? { customer_email: params.customerEmail }
        : {}),
    metadata: {
      type: 'stringing_order',
      orderId: params.orderId,
      orderNumber: params.orderNumber,
    },
  })

  return session
}
