import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'

export const metadata: Metadata = {
  title: 'SportTek - Tu carrera deportiva en una sola plataforma | Tenis y Padel',
  description: 'Plataforma integral para tenis y padel: analisis de video con IA, rankings nacionales, torneos, coaches certificados, matchmaking, reserva de canchas, tienda y comunidad.',
  openGraph: {
    title: 'SportTek - Tu carrera deportiva en una sola plataforma',
    description: 'Analisis IA, rankings, torneos, coaches, matchmaking, canchas y comunidad para tenis y padel.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'SportTek',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportTek - Tu carrera deportiva en una sola plataforma',
    description: 'Analisis IA, rankings, torneos, coaches y comunidad para tenis y padel.',
  },
}
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { RankingPreview } from '@/components/landing/RankingPreview'
import { CoachSection } from '@/components/landing/CoachSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { LandingFooter } from '@/components/landing/LandingFooter'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SportTek',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma integral para tenis y padel: analisis de video con IA, rankings nacionales, torneos, coaches certificados, matchmaking y comunidad.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://sporttek.xyz',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'PEN',
  },
  author: {
    '@type': 'Organization',
    name: 'SportTek',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://sporttek.xyz',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ServicesSection />
        <RankingPreview />
        <TestimonialsSection />
        <PricingSection />
        <CoachSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
