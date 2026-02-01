import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticacion | SportTek',
  description: 'Inicia sesion o crea tu cuenta en SportTek para mejorar tu tecnica deportiva.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mesh-gradient px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
