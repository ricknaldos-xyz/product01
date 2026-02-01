'use client'

import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'FREE',
    name: 'Descubre tu nivel',
    tagline: 'Prueba el poder del analisis IA',
    price: 0,
    currency: '',
    features: [
      '5 analisis de video por mes',
      '1 plan de entrenamiento activo',
      'Acceso a Tenis',
      'Ranking nacional basico',
      'Perfil de jugador',
      'Soporte por email',
    ],
    outcome: 'Ideal para descubrir tu skill score y entender tus errores tecnicos.',
    cta: 'Comenzar gratis',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Compite en serio',
    tagline: 'Todo lo que necesitas para mejorar cada semana',
    price: 24.90,
    currency: 'S/',
    features: [
      'Analisis ilimitados de video',
      'Planes de entrenamiento ilimitados',
      'Tenis y Padel',
      'Rankings multi-categoria completos',
      'Historial de progreso y estadisticas',
      'Matchmaking y desafios',
      'Torneos y badges',
      'Soporte prioritario',
    ],
    outcome: 'Para deportistas que entrenan varias veces por semana y quieren subir de tier.',
    cta: 'Elegir Pro',
    popular: true,
  },
  {
    id: 'ELITE',
    name: 'Entrena como profesional',
    tagline: 'Acceso total con herramientas avanzadas',
    price: 39.90,
    currency: 'S/',
    features: [
      'Todo en Pro',
      'Analisis en video HD',
      'Comparacion de progreso entre analisis',
      'Exportar informes PDF profesionales',
      'Sesiones de coaching virtual',
      'Acceso anticipado a nuevas funciones',
      'Soporte 24/7',
    ],
    outcome: 'Para competidores que buscan cada ventaja y quieren coaching personalizado.',
    cta: 'Elegir Elite',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Elige como quieres crecer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada plan esta disenado para un nivel de compromiso diferente.
            Cambia o cancela cuando quieras.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <GlassCard
              key={plan.id}
              intensity={plan.popular ? 'primary' : 'light'}
              padding="none"
              hover={plan.popular ? 'glow' : 'lift'}
              className={cn(
                'relative flex flex-col overflow-hidden',
                plan.popular && 'md:scale-105 shadow-glass-glow'
              )}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <GlassBadge variant="primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </GlassBadge>
                </div>
              )}

              <div className="p-6 pb-0">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Gratis' : `${plan.currency}${plan.price.toFixed(2)}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mes</span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed border-b border-glass pb-6">
                  {plan.outcome}
                </p>
              </div>

              <div className="p-6 pt-0 flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="glass-primary border-glass rounded-full p-1 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <GlassButton
                  asChild
                  variant={plan.popular ? 'solid' : 'outline'}
                  className="w-full"
                >
                  <Link href="/register">{plan.cta}</Link>
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sin tarjeta de credito para el plan gratuito. Precios en soles
          peruanos (PEN).
        </p>
      </div>
    </section>
  )
}
