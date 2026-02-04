'use client'

import { useState } from 'react'
import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Tenista amateur',
    location: 'Lima, Peru',
    since: 'Usa SportTek hace 4 meses',
    content:
      'La IA detectó que mi lanzamiento de saque era inconsistente y me dio un plan específico para corregirlo. En 3 semanas subí de 5ta B a 5ta A en el ranking.',
    rating: 5,
    highlight: '5ta B → 5ta A',
  },
  {
    name: 'Andrea P.',
    role: 'Jugadora de padel',
    location: 'Miraflores, Peru',
    since: 'Usa SportTek hace 2 meses',
    content:
      'El matchmaking me conectó con una pareja de mi nivel para un torneo. Seguimos jugando juntas cada semana desde que nos encontramos en la plataforma.',
    rating: 4,
    highlight: 'Pareja de torneo',
  },
  {
    name: 'Roberto S.',
    role: 'Entrenador de padel certificado',
    location: 'San Isidro, Peru',
    since: 'Usa SportTek hace 5 meses',
    content:
      'Registro mis alumnos en la plataforma y les asigno planes basados en sus análisis. Ver los errores objetivamente con la IA complementa mis sesiones presenciales.',
    rating: 5,
    highlight: '12 alumnos activos',
  },
  {
    name: 'María L.',
    role: 'Jugadora de padel',
    location: 'Surco, Peru',
    since: 'Usa SportTek hace 3 meses',
    content:
      'Empecé sin saber mi nivel real. Después de 5 análisis tengo claro mis fortalezas y debilidades. El plan de entrenamiento me da ejercicios nuevos cada semana.',
    rating: 5,
    highlight: 'De novata a 4ta A',
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonial = testimonials[activeIndex]

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Historias de la comunidad
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jugadores y entrenadores que usan SportTek para mejorar su rendimiento y conectar con otros deportistas.
          </p>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          {/* Quote icon */}
          <Quote className="h-12 w-12 text-primary/20 mx-auto mb-8" />

          {/* Quote text */}
          <p className="text-xl sm:text-2xl font-medium leading-relaxed mb-8">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* Author */}
          <div className="mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-semibold">
                {testimonial.name.charAt(0)}
              </span>
            </div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role} · {testimonial.location}
            </p>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver testimonio ${index + 1}`}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300',
                  index === activeIndex
                    ? 'w-8 bg-foreground'
                    : 'w-2.5 bg-foreground/20 hover:bg-foreground/40'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
