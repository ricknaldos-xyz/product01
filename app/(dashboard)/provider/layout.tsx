import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Proveedor | SportTech',
  description: 'Gestiona tu cuenta de proveedor de canchas y talleres.',
}

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
