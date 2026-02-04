import { Upload, Brain, Trophy } from 'lucide-react'

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

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                {/* Large translucent number */}
                <div className="relative mb-6">
                  <span className="text-8xl font-bold text-foreground/5">
                    {step.number}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
