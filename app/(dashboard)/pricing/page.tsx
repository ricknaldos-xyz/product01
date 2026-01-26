'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Para comenzar',
    price: 0,
    features: [
      '3 analisis por mes',
      '1 plan de entrenamiento activo',
      'Acceso a Tenis',
      'Soporte por email',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Para deportistas serios',
    price: 19.99,
    popular: true,
    features: [
      'Analisis ilimitados',
      'Planes de entrenamiento ilimitados',
      'Acceso a todos los deportes',
      'Historial completo',
      'Soporte prioritario',
    ],
  },
  {
    id: 'ELITE',
    name: 'Elite',
    description: 'Para profesionales',
    price: 49.99,
    features: [
      'Todo en Pro',
      'Analisis en video HD',
      'Comparacion de progreso avanzada',
      'Exportar informes PDF',
      'Sesiones de coaching virtual',
      'Soporte 24/7',
    ],
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const currentPlan = (session?.user as { subscription?: string })?.subscription || 'FREE'

  async function handleSubscribe(planId: string) {
    if (planId === 'FREE' || planId === currentPlan) return

    setLoading(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar pago')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar pago')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Planes y Precios</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Puedes cambiar o
          cancelar en cualquier momento.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isUpgrade =
            (currentPlan === 'FREE' && (plan.id === 'PRO' || plan.id === 'ELITE')) ||
            (currentPlan === 'PRO' && plan.id === 'ELITE')

          return (
            <div
              key={plan.id}
              className={cn(
                'relative bg-card border rounded-2xl p-6 flex flex-col',
                plan.popular && 'border-primary shadow-lg',
                isCurrentPlan && 'ring-2 ring-primary'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Plan actual
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/mes</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan || loading !== null || plan.id === 'FREE'}
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full"
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : isCurrentPlan ? (
                  'Plan actual'
                ) : isUpgrade ? (
                  'Mejorar plan'
                ) : plan.id === 'FREE' ? (
                  'Plan gratuito'
                ) : (
                  'Seleccionar'
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Los precios estan en USD. Puedes cancelar tu suscripcion en cualquier
          momento desde tu perfil.
        </p>
      </div>
    </div>
  )
}
