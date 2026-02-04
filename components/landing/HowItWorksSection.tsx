'use client'

import { Upload, Brain, Trophy, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Graba tu técnica',
    description: 'Solo necesitas 15-30 segundos con tu celular. Así de fácil.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'Recibe tu análisis',
    description: 'La IA detecta errores y te arma un plan para mejorar.',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Sube en el ranking',
    description: 'Entrena, compite en torneos y mide tu progreso.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            De tu video al ranking en 3 pasos
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sin complicaciones. Empieza a mejorar hoy mismo.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line - desktop only */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {/* Number badge */}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-white shadow-xl" />
                  <div className="relative flex flex-col items-center">
                    <span className="text-4xl font-bold text-foreground">{step.number}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-2">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
