import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeClient
}

// For backwards compatibility
export const stripe = {
  get customers() { return getStripeClient().customers },
  get subscriptions() { return getStripeClient().subscriptions },
  get checkout() { return getStripeClient().checkout },
  get billingPortal() { return getStripeClient().billingPortal },
  get webhooks() { return getStripeClient().webhooks },
}

export const PLANS = {
  FREE: {
    name: 'Free',
    description: 'Para comenzar',
    price: 0,
    priceId: null,
    features: [
      '3 analisis por mes',
      '1 plan de entrenamiento activo',
      'Acceso a Tenis',
      'Soporte por email',
    ],
    limits: {
      analysesPerMonth: 3,
      activePlans: 1,
    },
  },
  PRO: {
    name: 'Pro',
    description: 'Para deportistas serios',
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Analisis ilimitados',
      'Planes de entrenamiento ilimitados',
      'Acceso a todos los deportes',
      'Historial completo',
      'Soporte prioritario',
    ],
    limits: {
      analysesPerMonth: -1, // unlimited
      activePlans: -1,
    },
  },
  ELITE: {
    name: 'Elite',
    description: 'Para profesionales',
    price: 49.99,
    priceId: process.env.STRIPE_ELITE_PRICE_ID,
    features: [
      'Todo en Pro',
      'Analisis en video HD',
      'Comparacion de progreso avanzada',
      'Exportar informes PDF',
      'Sesiones de coaching virtual',
      'Soporte 24/7',
    ],
    limits: {
      analysesPerMonth: -1,
      activePlans: -1,
    },
  },
} as const

export type PlanType = keyof typeof PLANS
