'use client'

import { Upload, Brain, Trophy, Swords, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Registrate y sube tu primer video',
    description:
      'Elige tu deporte, graba tu tecnica con el movil y sube el video. Solo necesitas 10-30 segundos de grabacion.',
    detail: 'Tenis o padel',
  },
  {
    number: 2,
    icon: Brain,
    title: 'Recibe tu analisis y skill score',
    description:
      'La IA analiza tu tecnica, detecta errores especificos y te asigna un skill score. Sabras exactamente en que mejorar.',
    detail: 'Analisis en 2-5 minutos',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Entrena con tu plan personalizado',
    description:
      'Recibe ejercicios diarios para corregir cada error. Completa sesiones, registra tu progreso y sube de tier.',
    detail: 'Ejercicios paso a paso',
  },
  {
    number: 4,
    icon: Trophy,
    title: 'Compite y sube en el ranking',
    description:
      'Tu score alimenta el ranking nacional. Encuentra rivales de tu nivel, participa en torneos y gana badges.',
    detail: 'Rankings en vivo',
  },
  {
    number: 5,
    icon: Swords,
    title: 'Conecta con la comunidad',
    description:
      'Sigue a otros jugadores, encuentra coaches, reserva canchas y accede a la tienda y servicio de encordado.',
    detail: 'Todo en un solo lugar',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tu camino en SportTek</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde tu primer video hasta competir en el ranking nacional. Asi es la experiencia completa.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="relative flex gap-6">
                  {/* Step number circle */}
                  <div className="hidden md:flex flex-shrink-0 w-16 h-16 glass-primary border-glass shadow-glass-glow rounded-full items-center justify-center text-lg font-bold text-primary z-10">
                    {step.number}
                  </div>

                  {/* Step card */}
                  <GlassCard
                    intensity="light"
                    padding="lg"
                    hover="lift"
                    className="flex-1"
                  >
                    <div className="flex items-start gap-4">
                      {/* Mobile number */}
                      <div className="md:hidden flex-shrink-0 w-10 h-10 glass-primary border-glass rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {step.number}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <step.icon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {step.description}
                        </p>
                        <GlassBadge variant="default" size="sm">
                          {step.detail}
                        </GlassBadge>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
