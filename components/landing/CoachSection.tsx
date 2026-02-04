import Link from 'next/link'
import { GraduationCap, Users, Star, ArrowRight } from 'lucide-react'

const benefits = [
  {
    icon: Users,
    title: 'Gestiona tus alumnos',
    description: 'Asigna planes basados en el análisis de IA',
  },
  {
    icon: Star,
    title: 'Acumula reviews',
    description: 'Tu rating visible para nuevos alumnos',
  },
  {
    icon: GraduationCap,
    title: 'Perfil verificado',
    description: 'Muestra tus certificaciones y especialidades',
  },
]

export function CoachSection() {
  return (
    <section id="coaches" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-foreground rounded-[var(--radius-card)] p-8 lg:p-12 text-background">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left: Main pitch */}
              <div>
                <span className="inline-block px-4 py-1.5 bg-background/10 text-background text-sm font-medium rounded-full mb-4">
                  Para entrenadores
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Haz crecer tu carrera como coach
                </h2>
                <p className="text-background/70 leading-relaxed mb-8">
                  Únete al marketplace de entrenadores verificados. Conecta con deportistas que buscan mejorar y gestiona todo desde la app.
                </p>
                <Link
                  href="/register?type=coach"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground font-semibold rounded-full hover:bg-background/90 transition-colors"
                >
                  Registrarme como coach
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Right: Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4 bg-background/5 rounded-2xl p-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-0.5">{benefit.title}</h4>
                      <p className="text-sm text-background/60">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
