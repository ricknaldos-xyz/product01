'use client'

import { Star, Quote } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Tenista amateur',
    location: 'Lima, Peru',
    content:
      'La IA detecto que mi lanzamiento de saque era inconsistente y me dio un plan especifico para corregirlo. En 3 semanas subi de 5ta B a 5ta A en el ranking.',
    rating: 5,
    highlight: '5ta B → 5ta A',
  },
  {
    name: 'Andrea P.',
    role: 'Jugadora de padel',
    location: 'Miraflores, Peru',
    content:
      'El matchmaking me conecto con una pareja de mi nivel para un torneo. La comunidad es real: seguimos jugando juntas cada semana desde que nos encontramos en la plataforma.',
    rating: 5,
    highlight: 'Pareja de torneo',
  },
  {
    name: 'Roberto S.',
    role: 'Entrenador certificado',
    location: 'San Isidro, Peru',
    content:
      'Registro mis alumnos en la plataforma y les asigno planes basados en sus analisis. Ver los errores objetivamente con la IA complementa mis sesiones presenciales.',
    rating: 5,
    highlight: '12 alumnos activos',
  },
  {
    name: 'Maria L.',
    role: 'Jugadora de padel',
    location: 'Surco, Peru',
    content:
      'Empece sin saber mi nivel real. Despues de 5 analisis tengo claro mis fortalezas y debilidades. El plan de entrenamiento me da ejercicios nuevos cada semana.',
    rating: 5,
    highlight: 'De novata a 4ta A',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Historias de la comunidad
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jugadores y entrenadores que usan SportTek para mejorar su rendimiento y conectar con otros deportistas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <GlassCard
              key={index}
              intensity="light"
              padding="lg"
              hover="lift"
              className="relative"
            >
              {/* Quote decoration */}
              <div className="absolute -top-2 left-4">
                <div className="glass-primary border-glass rounded-full p-2">
                  <Quote className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3 mt-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 text-warning fill-warning"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-4 relative z-10 leading-relaxed text-sm">
                {testimonial.content}
              </p>

              {/* Highlight badge */}
              <GlassBadge variant="primary" size="sm" className="mb-4">
                {testimonial.highlight}
              </GlassBadge>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-glass">
                <div className="w-10 h-10 rounded-full glass-primary border-glass flex items-center justify-center text-primary font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
