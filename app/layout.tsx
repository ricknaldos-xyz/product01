import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'SportTek - Analisis Deportivo con IA',
  description: 'Mejora tu tecnica deportiva con analisis de video impulsado por inteligencia artificial',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SportTek',
  },
  openGraph: {
    title: 'SportTek - Analisis Deportivo con IA',
    description: 'Mejora tu tecnica deportiva con analisis de video impulsado por inteligencia artificial',
    type: 'website',
    locale: 'es_PE',
    siteName: 'SportTek',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportTek - Analisis Deportivo con IA',
    description: 'Mejora tu tecnica deportiva con analisis de video impulsado por IA',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://sporttek.xyz',
    languages: {
      'es-PE': process.env.NEXT_PUBLIC_APP_URL || 'https://sporttek.xyz',
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={dmSans.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium"
            >
              Saltar al contenido
            </a>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
