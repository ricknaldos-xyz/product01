import { Target } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Target className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">SportTech</span>
      </Link>
      {children}
    </div>
  )
}
