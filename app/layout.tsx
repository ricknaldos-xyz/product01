import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'SportTech - Analisis Deportivo con IA',
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
    title: 'SportTech',
  },
  openGraph: {
    title: 'SportTech - Analisis Deportivo con IA',
    description: 'Mejora tu tecnica deportiva con analisis de video impulsado por inteligencia artificial',
    type: 'website',
    locale: 'es_PE',
    siteName: 'SportTech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportTech - Analisis Deportivo con IA',
    description: 'Mejora tu tecnica deportiva con analisis de video impulsado por IA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
