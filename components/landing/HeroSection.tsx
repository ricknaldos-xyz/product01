'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background - Primary color gradient as default, image if available */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#256F50] via-[#1A5038] to-[#143D2B]">
        {/* Optional: Add hero image here when available */}
        {/* <Image src="/images/hero-tennis.jpg" alt="..." fill className="object-cover" /> */}
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
            Mejora tu técnica,{' '}
            <span className="italic">compite en el ranking</span>{' '}
            y disfruta cada partido
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sube tu video, recibe análisis con IA en minutos y sigue un plan personalizado.
            Tenis y padel en una sola plataforma.
          </p>

          {/* CTA - White pill with arrow */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center bg-white rounded-full shadow-xl hover:shadow-2xl transition-all">
              <Link
                href="/register"
                className="px-8 py-4 text-foreground font-semibold text-lg"
              >
                Empieza gratis
              </Link>
              <Link
                href="/register"
                className="w-14 h-14 bg-foreground text-white rounded-full flex items-center justify-center mr-1 hover:bg-foreground/90 transition-all"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <p className="text-sm text-white/60">
            Sin tarjeta de crédito · Listo en segundos
          </p>
        </div>
      </div>

      {/* Floating Badge - Bottom Right - Social Proof */}
      <div className="absolute bottom-8 right-8 z-10 hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-white flex items-center justify-center text-xs font-bold text-primary"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">+1,200 jugadores</p>
            <p className="text-xs text-muted-foreground">activos este mes</p>
          </div>
        </div>
      </div>

      {/* Floating Badge - Bottom Left - App download hint */}
      <div className="absolute bottom-8 left-8 z-10 hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Graba desde tu celular</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
