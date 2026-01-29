import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GraduationCap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CoachCTAProps {
  context: 'analysis' | 'training'
}

const contextMessages = {
  analysis: {
    title: 'Mejora con un entrenador',
    subtitle:
      'Un entrenador certificado puede ayudarte a corregir estos problemas mas rapido y de forma personalizada.',
  },
  training: {
    title: 'Entrena con un especialista',
    subtitle:
      'Los entrenadores verificados pueden personalizar este plan y guiarte para maximizar tus resultados.',
  },
}

export function CoachCTA({ context }: CoachCTAProps) {
  const { title, subtitle } = contextMessages[context]

  return (
    <GlassCard
      intensity="light"
      padding="lg"
      className="bg-gradient-to-r from-primary/5 to-transparent"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full glass-light border-glass flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Button */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <GlassButton variant="primary" size="sm" asChild>
            <Link href="/marketplace" className="w-full sm:w-auto">
              Ver Entrenadores
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  )
}
