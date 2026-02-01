'use client'

import Link from 'next/link'
import {
  MapPin,
  Wrench,
  Building2,
  CalendarCheck,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'

const providerTypes = [
  {
    icon: MapPin,
    badge: 'Canchas',
    title: 'Registra tus canchas deportivas',
    description:
      'Publica tus canchas de tenis, padel o pickleball en la plataforma. Los jugadores las encuentran por ubicacion, superficie y disponibilidad.',
    features: [
      { icon: CalendarCheck, text: 'Gestion de disponibilidad y horarios' },
      { icon: CreditCard, text: 'Reservas con pago integrado' },
      { icon: Building2, text: 'Perfil de proveedor verificado' },
      { icon: Clock, text: 'Indoor, outdoor y techado' },
    ],
  },
  {
    icon: Wrench,
    badge: 'Talleres de encordado',
    title: 'Ofrece tu servicio de encordado',
    description:
      'Registra tu taller y recibe pedidos de encordado. Los jugadores eligen marca, modelo, tension y tipo de servicio directamente desde la app.',
    features: [
      { icon: ShieldCheck, text: 'Servicio estandar y express' },
      { icon: MapPin, text: 'Recojo a domicilio o entrega en taller' },
      { icon: CreditCard, text: 'Pagos y precios transparentes' },
      { icon: Clock, text: 'Horarios de operacion configurables' },
    ],
  },
]

export function ProviderSection() {
  return (
    <section id="providers" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <GlassBadge variant="primary" size="lg" className="mb-4">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Para proveedores
          </GlassBadge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Lleva tu negocio deportivo a la plataforma
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Si tienes canchas o un taller de encordado, registrate como proveedor y conecta con miles de deportistas que buscan tus servicios.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {providerTypes.map((provider) => (
            <GlassCard
              key={provider.badge}
              intensity="light"
              padding="none"
              hover="glow"
              className="overflow-hidden"
            >
              {/* Header */}
              <div className="glass-primary px-6 py-4 flex items-center gap-3">
                <provider.icon className="h-5 w-5 text-primary" />
                <span className="font-semibold">{provider.badge}</span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{provider.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {provider.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {provider.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3 text-sm">
                      <div className="glass-primary border-glass rounded-full p-1.5">
                        <feature.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="text-center mt-10">
          <GlassButton variant="solid" size="lg" asChild>
            <Link href="/register?type=provider">
              Aplicar como proveedor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </GlassButton>
          <p className="text-sm text-muted-foreground mt-4">
            Proceso de verificacion con aprobacion en 24-48 horas.
          </p>
        </div>
      </div>
    </section>
  )
}
