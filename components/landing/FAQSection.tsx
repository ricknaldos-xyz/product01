'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: '¿Qué es SportTek exactamente?',
    answer:
      'SportTek es una plataforma integral para deportistas de tenis y padel. Combina análisis de video con IA, planes de entrenamiento personalizados, rankings nacionales, torneos, matchmaking, coach marketplace, reserva de canchas, tienda deportiva y servicio de encordado. Todo en un solo lugar.',
  },
  {
    question: '¿Cómo funciona el análisis con IA?',
    answer:
      'Subes un video de 10-30 segundos (MP4, MOV o WebM) de tu técnica. La IA lo analiza en 2-5 minutos, identifica errores específicos con niveles de severidad, te asigna un skill score y genera un plan de ejercicios para corregir cada error. Tus videos son privados y seguros.',
  },
  {
    question: '¿Qué deportes están disponibles?',
    answer:
      'Actualmente soportamos Tenis (saque, derecha, revés, volea) y Padel (bandeja, víbora, smash). Pickleball estará disponible próximamente. Cada deporte tiene su propio perfil, ranking y técnicas específicas. El plan gratuito incluye un deporte; Pro y Elite incluyen todos.',
  },
  {
    question: '¿Cómo funcionan los rankings y tiers?',
    answer:
      'Cada análisis contribuye a tu skill score. Según tu puntaje, estás en un tier: desde 5ta B (inicial) hasta 1ra A (elite). Los rankings se calculan por país, tier, grupo de edad y globalmente, con periodos semanal, mensual e histórico. Tu posición se actualiza en tiempo real.',
  },
  {
    question: '¿Cómo encuentro rivales o participo en torneos?',
    answer:
      'El matchmaking te sugiere rivales de tu nivel basándose en tu ELO score y ubicación. Puedes enviar desafíos y coordinar partidos. Los torneos tienen formatos de eliminación simple, doble y round robin con brackets, seeding y restricciones por tier y edad.',
  },
  {
    question: '¿Puedo cancelar mi suscripción en cualquier momento?',
    answer:
      'Sí, puedes cancelar en cualquier momento desde tu perfil. Sin compromisos ni penalizaciones. Tu acceso continúa hasta el final del periodo de facturación. El plan gratuito no requiere tarjeta de crédito.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas saber sobre la plataforma, desde el analisis IA hasta los servicios del ecosistema.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <GlassCard
              key={index}
              intensity="ultralight"
              padding="none"
              className="overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors rounded-[inherit]"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
