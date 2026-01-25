'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  },
  {
    name: 'Nuevo Analisis',
    href: '/analyze',
    icon: Video,
  },
  {
    name: 'Mis Analisis',
    href: '/analyses',
    icon: History,
  },
  {
    name: 'Entrenamiento',
    href: '/training',
    icon: Dumbbell,
  },
  {
    name: 'Perfil',
    href: '/profile',
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Target className="h-8 w-8 text-primary" />
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
      <div className="p-4 border-t border-border">
        <Link
          href="/analyze"
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Video className="h-4 w-4" />
          Analizar Video
        </Link>
      </div>
    </aside>
  )
}
