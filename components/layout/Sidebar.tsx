'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  Trophy,
  Swords,
  Flag,
  Users,
  ShoppingBag,
  Wrench,
  Medal,
  CircleDot,
  Bell,
  GraduationCap,
  Shield,
  MapPin,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  tourId: string
}

const mainNavigation: NavItem[] = [
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
    name: 'Objetivos',
    href: '/goals',
    icon: Target,
    tourId: 'goals',
  },
]

const competitionNavigation: NavItem[] = [
  {
    name: 'Rankings',
    href: '/rankings',
    icon: Trophy,
    tourId: 'rankings',
  },
  {
    name: 'Matchmaking',
    href: '/matchmaking',
    icon: Swords,
    tourId: 'matchmaking',
  },
  {
    name: 'Desafios',
    href: '/challenges',
    icon: Flag,
    tourId: 'challenges',
  },
  {
    name: 'Torneos',
    href: '/tournaments',
    icon: Medal,
    tourId: 'tournaments',
  },
  {
    name: 'Partidos',
    href: '/matches',
    icon: CircleDot,
    tourId: 'matches',
  },
]

const communityNavigation: NavItem[] = [
  {
    name: 'Comunidad',
    href: '/community',
    icon: Users,
    tourId: 'community',
  },
  {
    name: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
    tourId: 'notifications',
  },
]

const servicesNavigation: NavItem[] = [
  {
    name: 'Canchas',
    href: '/courts',
    icon: MapPin,
    tourId: 'courts',
  },
  {
    name: 'Tienda',
    href: '/tienda',
    icon: ShoppingBag,
    tourId: 'shop',
  },
  {
    name: 'Encordado',
    href: '/encordado',
    icon: Wrench,
    tourId: 'stringing',
  },
]

const profileNavigation: NavItem[] = [
  {
    name: 'Mi Perfil',
    href: '/profile',
    icon: User,
    tourId: 'profile',
  },
]

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
  const user = session?.user as { hasCoachProfile?: boolean; role?: string } | undefined

  const roleNavigation: NavItem[] = []
  if (user?.hasCoachProfile) {
    roleNavigation.push({
      name: 'Coach Dashboard',
      href: '/coach/dashboard',
      icon: GraduationCap,
      tourId: 'coach-dashboard',
    })
  }
  if (user?.role === 'ADMIN') {
    roleNavigation.push({
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      tourId: 'admin',
    })
  }

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
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <NavSection items={mainNavigation} />
        <hr className="border-glass mx-2" />
        <NavSection items={competitionNavigation} label="Competencia" />
        <hr className="border-glass mx-2" />
        <NavSection items={communityNavigation} label="Social" />
        <hr className="border-glass mx-2" />
        <NavSection items={servicesNavigation} label="Servicios" />
        {roleNavigation.length > 0 && (
          <>
            <hr className="border-glass mx-2" />
            <NavSection items={roleNavigation} label="Gestion" />
          </>
        )}
        <hr className="border-glass mx-2" />
        <NavSection items={profileNavigation} />
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
