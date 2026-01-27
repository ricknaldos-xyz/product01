'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassButton } from '@/components/ui/glass-button'
import {
  Target,
  LayoutDashboard,
  Video,
  History,
  Dumbbell,
  User,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    tourId: 'dashboard',
  },
  {
    name: 'Nuevo Analisis',
    href: '/analyze',
    icon: Video,
    tourId: 'new-analysis',
  },
  {
    name: 'Mis Analisis',
    href: '/analyses',
    icon: History,
    tourId: 'analyses',
  },
  {
    name: 'Entrenamiento',
    href: '/training',
    icon: Dumbbell,
    tourId: 'training',
  },
  {
    name: 'Perfil',
    href: '/profile',
    icon: User,
    tourId: 'profile',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass-light border-r border-glass">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-glass">
        <div className="glass-primary border-glass rounded-xl p-2">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xl font-bold">SportTech</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              data-tour={item.tourId}
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
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-glass">
        <GlassButton variant="solid" className="w-full" asChild>
          <Link href="/analyze">
            <Video className="h-4 w-4 mr-2" />
            Analizar Video
          </Link>
        </GlassButton>
      </div>
    </aside>
  )
}
