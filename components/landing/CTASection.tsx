'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#256F50] via-[#1A5038] to-[#143D2B] p-10 lg:p-16">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Tu siguiente nivel empieza hoy
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
                Análisis IA, rankings, torneos, coaches, canchas y comunidad.
                Todo para tenis y padel en una sola plataforma.
              </p>

              <div className="flex items-center justify-center mb-6">
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
        </div>
      </div>
    </section>
  )
}
