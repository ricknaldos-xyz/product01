'use client'

import Link from 'next/link'
import {
  ShoppingBag,
  Wrench,
  MapPin,
  Swords,
  ArrowUpRight,
} from 'lucide-react'

const services = [
  {
    icon: ShoppingBag,
    title: 'Tienda',
    description: 'Raquetas, pelotas y accesorios de las mejores marcas.',
    href: '/tienda',
  },
  {
    icon: Wrench,
    title: 'Encordado',
    description: 'Elige tensión y cuerda. Recojo a domicilio disponible.',
    href: '/encordado',
  },
  {
    icon: MapPin,
    title: 'Canchas',
    description: 'Reserva canchas cerca de ti con pago online.',
    href: '/courts',
  },
  {
    icon: Swords,
    title: 'Rivales',
    description: 'Encuentra jugadores de tu nivel para partidos.',
    href: '/matchmaking',
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Todo en un solo lugar
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tienda, encordado, canchas y matchmaking para que solo te preocupes por jugar.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
