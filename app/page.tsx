import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'

export const metadata: Metadata = {
  title: 'SportTek - Tu carrera deportiva en una sola plataforma | Tenis, Padel, Pickleball',
  description: 'Plataforma integral para tenis, padel y pickleball: analisis de video con IA, rankings nacionales, torneos, coaches certificados, matchmaking, reserva de canchas, tienda y comunidad.',
  openGraph: {
    title: 'SportTek - Tu carrera deportiva en una sola plataforma',
    description: 'Analisis IA, rankings, torneos, coaches, matchmaking, canchas y comunidad para tenis, padel y pickleball.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'SportTek',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportTek - Tu carrera deportiva en una sola plataforma',
    description: 'Analisis IA, rankings, torneos, coaches y comunidad para tenis, padel y pickleball.',
  },
}
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { RankingPreview } from '@/components/landing/RankingPreview'
import { CoachSection } from '@/components/landing/CoachSection'
import { ProviderSection } from '@/components/landing/ProviderSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RankingPreview />
        <CoachSection />
        <ProviderSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
