import Link from 'next/link'
import {
  Brain,
  Target,
  Trophy,
  Medal,
  Users,
  GraduationCap,
  MapPin,
  ArrowUpRight,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Análisis con IA',
    description:
      'Sube un video y en minutos sabrás exactamente qué corregir. La IA analiza tu golpe y te arma un plan paso a paso.',
    href: '/register',
    colSpan: 2,
    dark: false,
  },
  {
    icon: Target,
    title: 'Planes personalizados',
    description:
      'Ejercicios que avanzan cada semana según tu progreso real.',
    href: '/register',
    colSpan: 1,
    dark: false,
  },
  {
    icon: Trophy,
    title: 'Rankings nacionales',
    description:
      'Compara tu nivel con otros jugadores de Perú. Rankings semanal, mensual e histórico.',
    href: '/rankings',
    colSpan: 1,
    dark: true,
  },
  {
    icon: Medal,
    title: 'Torneos y competencias',
    description:
      'Participa en torneos reales con brackets y premios. Gana badges por tus logros.',
    href: '/tournaments',
    colSpan: 1,
    dark: false,
  },
  {
    icon: GraduationCap,
    title: 'Encuentra entrenadores',
    description:
      'Coaches certificados con reviews y precios claros. Agenda clases fácilmente.',
    href: '/coaches',
    colSpan: 1,
    dark: false,
  },
  {
    icon: MapPin,
    title: 'Reserva canchas',
    description:
      'Canchas cerca de ti con disponibilidad en tiempo real.',
    href: '/courts',
    colSpan: 1,
    dark: true,
  },
  {
    icon: Users,
    title: 'Comunidad activa',
    description:
      'Conoce jugadores de tu nivel y organiza partidos.',
    href: '/register',
    colSpan: 1,
    dark: false,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Ecosistema
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un ecosistema completo para tu desarrollo deportivo
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            const isDark = feature.dark

            return (
              <div
                key={idx}
                className={`group relative rounded-[var(--radius-card)] p-8 transition-all ${
                  feature.colSpan === 2 ? 'lg:col-span-2' : ''
                } ${
                  isDark
                    ? 'bg-foreground text-background'
                    : 'bg-secondary/50'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${
                    isDark ? 'bg-background/10' : 'bg-primary/10'
                  }`}
                >
                  <feature.icon
                    className={`h-6 w-6 ${isDark ? 'text-background' : 'text-primary'}`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-background/70' : 'text-muted-foreground'
                  }`}
                >
                  {feature.description}
                </p>

                {/* Arrow Button - Bottom Right */}
                <Link
                  href={feature.href}
                  className={`absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                    isDark
                      ? 'bg-background text-foreground'
                      : 'bg-foreground text-background'
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
