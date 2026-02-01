'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'
import { CelebrationOverlay } from '@/components/gamification/CelebrationOverlay'
import { SportProvider } from '@/contexts/SportContext'
import { useState } from 'react'
import { X, Target } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/layout/BottomNav'
import { SidebarSportSelector } from '@/components/layout/SidebarSportSelector'
import { getNavigationSections } from '@/lib/navigation'
import { useSport } from '@/contexts/SportContext'

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { activeSport } = useSport()
  const user = session?.user as { hasPlayerProfile?: boolean; hasCoachProfile?: boolean; role?: string } | undefined

  if (!open) return null

  const sportLabel = activeSport ? activeSport.name : 'Mi Deporte'
  const sections = getNavigationSections(user, sportLabel)

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegacion">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SportTek</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sport Selector */}
        <div className="pt-4">
          <SidebarSportSelector />
        </div>

        <nav className="px-3 py-2 space-y-1 overflow-y-auto flex-1">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {sectionIdx > 0 && <hr className="border-border my-2" />}
              {section.label && (
                <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
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
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isNewUser = !session?.user?.hasPlayerProfile

  return (
    <OnboardingProvider isNewUser={isNewUser}>
      {children}
    </OnboardingProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SportProvider>
        <div className="min-h-screen bg-background">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-background focus:border focus:border-glass focus:text-primary focus:shadow-lg">Saltar al contenido</a>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile menu */}
          <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

          {/* Main content */}
          <div className="lg:pl-64">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
            <main id="main-content" className="p-4 lg:p-6 pb-20 lg:pb-6">
              <OnboardingWrapper>
                {children}
              </OnboardingWrapper>
            </main>
          </div>

          {/* Celebration Overlay */}
          <CelebrationOverlay />

          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </SportProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
