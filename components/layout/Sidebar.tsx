'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { GlassButton } from '@/components/ui/glass-button'
import { Target, Video, ChevronRight } from 'lucide-react'
import { SidebarSportSelector } from '@/components/layout/SidebarSportSelector'
import { getNavigationSections, type NavItem } from '@/lib/navigation'
import { useSport } from '@/contexts/SportContext'

function NavSection({ items, label }: { items: NavItem[]; label?: string }) {
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <div>
      {label && (
        <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
          {label}
        </p>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            data-tour={item.tourId}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-[var(--duration-normal)]',
              isActive
                ? 'glass-primary border-glass text-primary shadow-glass'
                : 'text-muted-foreground hover:glass-ultralight hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const { data: session } = useSession()
  const { activeSport } = useSport()
  const user = session?.user as { hasPlayerProfile?: boolean; hasCoachProfile?: boolean; role?: string } | undefined

  const sportLabel = activeSport ? activeSport.name : 'Mi Deporte'
  const sections = getNavigationSections(user, sportLabel)

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass-light border-r border-glass">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-glass">
        <div className="glass-primary border-glass rounded-xl p-2">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xl font-bold">SportTek</span>
      </div>

      {/* Sport Selector */}
      <div className="pt-4">
        <SidebarSportSelector />
      </div>

      {/* Navigation */}
      <nav role="navigation" aria-label="Navegacion principal" className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {sections.map((section, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <hr className="border-glass mx-2" />}
            <NavSection items={section.items} label={section.label} />
          </React.Fragment>
        ))}
      </nav>

      {/* Quick Actions */}
      {(user?.hasPlayerProfile || user?.hasCoachProfile) && (
        <div className="p-4 border-t border-glass">
          <GlassButton variant="solid" className="w-full" asChild>
            <Link href="/analyze">
              <Video className="h-4 w-4 mr-2" />
              Analizar Video
            </Link>
          </GlassButton>
        </div>
      )}
    </aside>
  )
}
