import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Tu siguiente nivel empieza hoy
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Análisis IA, rankings, torneos, coaches, canchas y comunidad.
            Todo para tenis y padel en una sola plataforma.
          </p>

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
      </div>
    </section>
  )
}
