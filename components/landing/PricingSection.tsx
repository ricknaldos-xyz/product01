'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PlanType = 'players' | 'coaches'

const playerPlans = [
  {
    id: 'FREE',
    name: 'Gratis',
    subtitle: 'Descubre tu nivel',
    price: 0,
    period: null,
    description: '5 análisis de video al mes, 1 plan de entrenamiento, ranking básico de tenis',
    badge: null,
    background: 'light' as const,
    cta: 'Empezar gratis',
    href: '/register?type=player',
  },
  {
    id: 'PRO',
    name: 'Pro',
    subtitle: 'Para competir en serio',
    price: 24.90,
    period: '/mes',
    description: 'Análisis ilimitados de tenis y padel, torneos, matchmaking y rankings completos',
    badge: 'Popular',
    background: 'primary' as const,
    cta: 'Elegir Pro',
    href: '/register?type=player',
  },
  {
    id: 'ELITE',
    name: 'Elite',
    subtitle: 'Entrena como profesional',
    price: 39.90,
    period: '/mes',
    description: 'Todo en Pro + análisis HD, comparación de progreso, informes y badge Elite',
    badge: 'Premium',
    background: 'image' as const,
    cta: 'Elegir Elite',
    href: '/register?type=player',
  },
]

const coachPlans = [
  {
    id: 'STARTER',
    name: 'Starter',
    subtitle: 'Empieza a captar alumnos',
    price: 0,
    period: null,
    commission: '15%',
    description: 'Perfil en marketplace, hasta 5 alumnos, reviews de clientes',
    badge: null,
    background: 'light' as const,
    cta: 'Registrarme gratis',
    href: '/register?type=coach',
  },
  {
    id: 'PRO',
    name: 'Pro',
    subtitle: 'Haz crecer tu negocio',
    price: 49.90,
    period: '/mes',
    commission: '8%',
    description: 'Alumnos ilimitados, planes IA para asignar, perfil destacado',
    badge: 'Popular',
    background: 'primary' as const,
    cta: 'Elegir Pro',
    href: '/register?type=coach',
  },
  {
    id: 'ELITE',
    name: 'Elite',
    subtitle: 'Máxima visibilidad',
    price: 89.90,
    period: '/mes',
    commission: '0%',
    description: 'Sin comisiones, badge verificado, posición top en búsquedas',
    badge: 'Sin comisión',
    background: 'image' as const,
    cta: 'Elegir Elite',
    href: '/register?type=coach',
  },
]

export function PricingSection() {
  const [activeTab, setActiveTab] = useState<PlanType>('players')
  const plans = activeTab === 'players' ? playerPlans : coachPlans

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Elige el plan que va contigo
          </h2>
          <p className="text-lg text-muted-foreground">
            Cambia o cancela cuando quieras, sin compromisos
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-secondary rounded-full p-1">
            <button
              onClick={() => setActiveTab('players')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                activeTab === 'players'
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Soy jugador
            </button>
            <button
              onClick={() => setActiveTab('coaches')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                activeTab === 'coaches'
                  ? 'bg-foreground text-background shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Soy entrenador
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPrimary = plan.background === 'primary'
            const isImage = plan.background === 'image'

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-3xl overflow-hidden transition-all hover:shadow-xl',
                  isPrimary && 'bg-[#c8f7c5]',
                  isImage && 'bg-cover bg-center',
                  !isPrimary && !isImage && 'bg-white shadow-lg'
                )}
                style={
                  isImage
                    ? {
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('/images/tennis-court-bg.jpg')`,
                        backgroundColor: '#1a3d2b',
                      }
                    : undefined
                }
              >
                {/* Top badges row */}
                <div className="flex items-start justify-between p-6 pb-0">
                  {/* Left badge */}
                  {plan.badge && (
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full',
                        isImage
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : 'bg-foreground/10 text-foreground'
                      )}
                    >
                      {plan.badge}
                    </span>
                  )}
                  {!plan.badge && <span />}

                  {/* Right: Social proof for paid plans */}
                  {(isPrimary || isImage) && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                              isImage
                                ? 'bg-white/20 border-white/40 text-white'
                                : 'bg-white border-white text-foreground/60'
                            )}
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <span
                        className={cn(
                          'text-xs',
                          isImage ? 'text-white/80' : 'text-foreground/60'
                        )}
                      >
                        {activeTab === 'players' ? 'El más' : '+50 coaches'}
                        <br />
                        {activeTab === 'players' ? 'elegido' : 'activos'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Main content */}
                <div className="p-6 pt-8">
                  {/* Plan name - large */}
                  <h3
                    className={cn(
                      'text-4xl sm:text-5xl font-bold mb-1',
                      isImage ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm mb-6',
                      isImage ? 'text-white/70' : 'text-muted-foreground'
                    )}
                  >
                    {plan.subtitle}
                  </p>

                  {/* Price pill */}
                  <div className="mb-2">
                    <span
                      className={cn(
                        'inline-flex items-baseline rounded-full px-5 py-2 text-2xl font-bold',
                        isImage
                          ? 'bg-white text-foreground'
                          : isPrimary
                          ? 'bg-[#256F50] text-white'
                          : 'bg-foreground text-background'
                      )}
                    >
                      {plan.price === 0 ? (
                        'S/0'
                      ) : (
                        <>S/{plan.price.toFixed(0)}</>
                      )}
                      {plan.period && (
                        <span className="text-sm font-normal ml-1 opacity-70">
                          {plan.period}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Commission badge for coaches */}
                  {activeTab === 'coaches' && 'commission' in plan && (
                    <p
                      className={cn(
                        'text-sm font-medium mb-6',
                        isImage ? 'text-white/90' : 'text-foreground/70'
                      )}
                    >
                      + {(plan as typeof coachPlans[number]).commission} comisión por sesión
                    </p>
                  )}

                  {activeTab === 'players' && <div className="mb-6" />}

                  {/* Description */}
                  <p
                    className={cn(
                      'text-sm leading-relaxed mb-8',
                      isImage ? 'text-white/80' : 'text-muted-foreground'
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Footer with CTA */}
                <div className="px-6 pb-6">
                  <div
                    className={cn(
                      'flex items-center justify-between pt-4 border-t',
                      isImage ? 'border-white/20' : 'border-foreground/10'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isImage ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {plan.cta}
                    </span>
                    <Link
                      href={plan.href}
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105',
                        isImage
                          ? 'bg-white text-foreground'
                          : 'bg-foreground text-background'
                      )}
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Precios en soles peruanos (PEN). Sin compromisos.
        </p>
      </div>
    </section>
  )
}
