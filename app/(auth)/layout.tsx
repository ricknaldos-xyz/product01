import { Target } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mesh-gradient px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 mb-8 relative z-10"
      >
        <div className="glass-primary border-glass rounded-xl p-2 shadow-glass-glow">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <span className="text-2xl font-bold">SportTech</span>
      </Link>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
