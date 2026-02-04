'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'FREE',
    name: 'Descubre tu nivel',
    tagline: 'Prueba el poder del analisis IA',
    price: 0,
    currency: '',
    features: [
      '5 análisis de video por mes',
      '1 plan de entrenamiento activo',
      'Tenis (un deporte)',
      'Ranking nacional basico',
      'Perfil de jugador',
      'Soporte por email',
    ],
    outcome: 'Ideal para descubrir tu skill score y entender tus errores tecnicos.',
    cta: 'Comenzar gratis',
    note: 'Sin tarjeta de crédito',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Compite en serio',
    tagline: 'Menos que una clase particular',
    price: 24.90,
    currency: 'S/',
    features: [
      'Análisis ilimitados de video',
      'Planes de entrenamiento ilimitados',
      'Tenis, Padel y más',
      'Rankings multi-categoria completos',
      'Historial de progreso y estadisticas',
      'Matchmaking y desafios',
      'Torneos y badges',
      'Soporte prioritario',
    ],
    outcome: 'Para deportistas que entrenan varias veces por semana y quieren subir de tier.',
    cta: 'Elegir Pro',
    note: null,
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
    note: 'Próximamente: descuento anual',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Precios
          </span>
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
              intensity="light"
              padding="none"
              className="relative flex flex-col overflow-hidden"
            >
              {plan.popular && (
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-foreground text-background text-xs font-medium px-3 py-1">
                    Popular
                  </span>
                </div>
              )}

              <div className={cn('p-6 pb-0', plan.popular && 'pt-12')}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="inline-flex items-baseline rounded-full bg-foreground text-background px-4 py-1.5 text-2xl font-bold">
                    {plan.price === 0 ? 'Gratis' : `${plan.currency}${plan.price.toFixed(2)}`}
                    {plan.price > 0 && (
                      <span className="text-background/60 text-sm font-normal ml-1">/mes</span>
                    )}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed border-b border-border/40 pb-6">
                  {plan.outcome}
                </p>
              </div>

              <div className="p-6 pt-0 flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between">
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {plan.cta}
                  </Link>
                  <GlassButton variant="default" size="icon-circle" asChild>
                    <Link href="/register">
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </GlassButton>
                </div>
                {plan.note && (
                  <p className="text-xs text-muted-foreground mt-3">{plan.note}</p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Precios en soles peruanos (PEN). Cambia o cancela cuando quieras.
        </p>
      </div>
    </section>
  )
}
