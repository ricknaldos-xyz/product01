'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useState } from 'react'
import { X, Target } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Video,
  History,
  Dumbbell,
  User,
} from 'lucide-react'

const queryClient = new QueryClient()

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Nuevo Analisis', href: '/analyze', icon: Video },
  { name: 'Mis Analisis', href: '/analyses', icon: History },
  { name: 'Entrenamiento', href: '/training', icon: Dumbbell },
  { name: 'Perfil', href: '/profile', icon: User },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <div className="min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Target className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">SportTech</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="px-3 py-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="lg:pl-64">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </SessionProvider>
    </QueryClientProvider>
  )
}
