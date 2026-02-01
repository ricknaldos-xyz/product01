'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Que es SportTek exactamente?',
    answer:
      'SportTek es una plataforma integral para deportistas de tenis y padel. Combina analisis de video con IA, planes de entrenamiento personalizados, rankings nacionales, torneos, matchmaking, coach marketplace, reserva de canchas, tienda deportiva y servicio de encordado. Todo en un solo lugar.',
  },
  {
    question: 'Como funciona el analisis con IA?',
    answer:
      'Subes un video de 10-30 segundos (MP4, MOV o WebM) de tu tecnica. La IA lo analiza en 2-5 minutos, identifica errores especificos con niveles de severidad (bajo, medio, alto, critico), te asigna un skill score y genera un plan de ejercicios para corregir cada error.',
  },
  {
    question: 'Que deportes estan disponibles?',
    answer:
      'Actualmente soportamos Tenis (saque, derecha, reves, volea) y Padel (bandeja, vibora, smash). Pickleball estara disponible proximamente. Cada deporte tiene su propio perfil de jugador, ranking y tecnicas especificas. El plan gratuito incluye un deporte; Pro y Elite incluyen todos.',
  },
  {
    question: 'Como funcionan los rankings y tiers?',
    answer:
      'Cada analisis contribuye a tu skill score. Segun tu puntaje, estas en un tier: desde 5ta B (inicial) hasta 1ra A (elite). Los rankings se calculan por pais, tier, grupo de edad y globalmente, con periodos semanal, mensual e historico. Tu posicion se actualiza en tiempo real.',
  },
  {
    question: 'Como encuentro rivales o participo en torneos?',
    answer:
      'El matchmaking te sugiere rivales de tu nivel basandose en tu ELO score y ubicacion. Puedes enviar desafios y coordinar partidos. Los torneos tienen formatos de eliminacion simple, doble y round robin con brackets, seeding y restricciones por tier y edad.',
  },
  {
    question: 'Que ofrece el Coach Marketplace?',
    answer:
      'Es un directorio de entrenadores verificados por deporte, ubicacion y especialidad. Los coaches tienen perfiles con certificaciones, reviews, tarifas y gestion de alumnos. Pueden asignar planes de entrenamiento basados en los analisis IA de sus alumnos.',
  },
  {
    question: 'Puedo registrar mi cancha o taller de encordado?',
    answer:
      'Si. Los proveedores de canchas y talleres de encordado pueden aplicar desde la plataforma. Las canchas se publican con ubicacion, superficie, disponibilidad y pago integrado. Los talleres reciben pedidos con seleccion de cuerda, tension y tipo de servicio.',
  },
  {
    question: 'Puedo cancelar mi suscripcion en cualquier momento?',
    answer:
      'Si, puedes cancelar en cualquier momento desde tu perfil. Sin compromisos ni penalizaciones. Tu acceso continua hasta el final del periodo de facturacion. El plan gratuito no requiere tarjeta de credito.',
  },
  {
    question: 'Mis videos son privados?',
    answer:
      'Si. Tus videos se almacenan de forma segura y privada. Solo tu (y tu coach si decides compartirlos) pueden acceder a ellos. Nunca compartimos tu contenido con terceros. Ademas, contamos con deteccion de duplicados y verificacion de autenticidad.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas saber sobre la plataforma, desde el analisis IA hasta los servicios del ecosistema.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <GlassCard
              key={index}
              intensity={openIndex === index ? 'medium' : 'light'}
              padding="none"
              className="overflow-hidden transition-all duration-[var(--duration-normal)]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:glass-ultralight transition-all duration-[var(--duration-normal)] rounded-2xl"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <div
                  className={cn(
                    'glass-primary border-glass rounded-full p-1.5 transition-transform duration-[var(--duration-normal)]',
                    openIndex === index && 'rotate-180'
                  )}
                >
                  <ChevronDown className="h-4 w-4 text-primary" />
                </div>
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-[var(--duration-slow)] ease-[var(--ease-liquid)]',
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
