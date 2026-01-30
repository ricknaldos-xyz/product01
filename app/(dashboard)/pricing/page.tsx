'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Check, Loader2 } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import CulqiCheckout from '@/components/CulqiCheckout'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PLANS } from '@/lib/plans'

const plans = Object.entries(PLANS).map(([id, plan]) => ({
  id,
  name: plan.name,
  description: plan.description,
  price: plan.price,
  popular: id === 'PRO',
  features: plan.features,
}))

export default function PricingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const currentPlan = (session?.user as { subscription?: string })?.subscription || 'FREE'

  async function handleToken(tokenId: string) {
    setLoading(selectedPlan)
    try {
      const response = await fetch('/api/culqi/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, tokenId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      toast.success('Suscripcion activada correctamente')
      // Refresh session
      window.location.href = '/dashboard?checkout=success'
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar pago')
    } finally {
      setLoading(null)
      setSelectedPlan(null)
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
            <GlassCard
              key={plan.id}
              intensity={plan.popular ? 'medium' : 'light'}
              padding="lg"
              className={cn(
                'relative flex flex-col',
                plan.popular && 'shadow-glass-glow border-primary/30',
                isCurrentPlan && 'ring-2 ring-primary'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-glass-glow">
                    Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-success text-white text-xs font-medium px-3 py-1 rounded-full">
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
                  S/{plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/mes</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <div className="bg-success/20 rounded-full p-0.5 mt-0.5 flex-shrink-0">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <GlassButton
                onClick={() => setSelectedPlan(plan.id)}
                disabled={isCurrentPlan || loading !== null || plan.id === 'FREE'}
                variant={plan.popular ? 'solid' : 'outline'}
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
              </GlassButton>
              {selectedPlan === plan.id && (
                <div className="mt-4">
                  <CulqiCheckout
                    amount={Math.round(plan.price * 100)}
                    title={`Plan ${plan.name}`}
                    description={`Suscripcion mensual Plan ${plan.name}`}
                    onToken={handleToken}
                    onError={(msg) => toast.error(msg)}
                    loading={loading === plan.id}
                    buttonText="Pagar suscripcion"
                    buttonVariant="solid"
                  />
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Los precios estan en Soles (PEN). Puedes cancelar tu suscripcion en cualquier
          momento desde tu perfil.
        </p>
      </div>
    </div>
  )
}
