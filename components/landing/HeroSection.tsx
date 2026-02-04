'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-background">
      {/* Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
            Mejora tu técnica,{' '}
            <span className="text-primary">compite en el ranking</span>{' '}
            y disfruta cada partido
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Sube tu video, recibe análisis con IA en minutos y sigue un plan personalizado.
            Tenis y padel en una sola plataforma.
          </p>

          {/* Single Dark CTA */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-lg font-semibold rounded-full hover:bg-foreground/90 transition-colors"
          >
            Empieza gratis
            <ArrowRight className="h-5 w-5" />
          </Link>

          <p className="text-sm text-muted-foreground mt-6">
            Sin tarjeta de crédito · Listo en segundos
          </p>
        </div>

        {/* Stats Counter */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 md:gap-20">
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-foreground">1,200+</p>
            <p className="text-sm text-muted-foreground mt-1">Jugadores activos</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-foreground">5,000+</p>
            <p className="text-sm text-muted-foreground mt-1">Análisis realizados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground mt-1">Entrenadores</p>
          </div>
        </div>
      </div>
    </section>
  )
}
