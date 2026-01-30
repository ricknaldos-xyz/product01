import {
  Video,
  History,
  Dumbbell,
  Target,
  Trophy,
  Swords,
  Flag,
  Medal,
  CircleDot,
  LayoutDashboard,
  Users,
  Bell,
  MapPin,
  ShoppingBag,
  Wrench,
  User,
  GraduationCap,
  Shield,
  BarChart3,
  UserCheck,
  Building2,
  ClipboardList,
  Inbox,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  tourId: string
}

export const sportNavigation: NavItem[] = [
  { name: 'Nuevo Analisis', href: '/analyze', icon: Video, tourId: 'new-analysis' },
  { name: 'Mis Analisis', href: '/analyses', icon: History, tourId: 'analyses' },
  { name: 'Entrenamiento', href: '/training', icon: Dumbbell, tourId: 'training' },
  { name: 'Objetivos', href: '/goals', icon: Target, tourId: 'goals' },
]

export const competitionNavigation: NavItem[] = [
  { name: 'Rankings', href: '/rankings', icon: Trophy, tourId: 'rankings' },
  { name: 'Matchmaking', href: '/matchmaking', icon: Swords, tourId: 'matchmaking' },
  { name: 'Desafios', href: '/challenges', icon: Flag, tourId: 'challenges' },
  { name: 'Torneos', href: '/tournaments', icon: Medal, tourId: 'tournaments' },
  { name: 'Partidos', href: '/matches', icon: CircleDot, tourId: 'matches' },
]

export const globalNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { name: 'Comunidad', href: '/community', icon: Users, tourId: 'community' },
  { name: 'Notificaciones', href: '/notifications', icon: Bell, tourId: 'notifications' },
  { name: 'Canchas', href: '/courts', icon: MapPin, tourId: 'courts' },
  { name: 'Tienda', href: '/tienda', icon: ShoppingBag, tourId: 'shop' },
  { name: 'Encordado', href: '/encordado', icon: Wrench, tourId: 'stringing' },
]

export const profileNavigation: NavItem[] = [
  { name: 'Mi Perfil', href: '/profile', icon: User, tourId: 'profile' },
]

export const coachNavigation: NavItem[] = [
  { name: 'Coach Dashboard', href: '/coach/dashboard', icon: GraduationCap, tourId: 'coach-dashboard' },
  { name: 'Mis Alumnos', href: '/coach/students', icon: Users, tourId: 'coach-students' },
]

export const providerCourtNavigation: NavItem[] = [
  { name: 'Mis Canchas', href: '/provider/courts', icon: MapPin, tourId: 'provider-courts' },
]

export const providerWorkshopNavigation: NavItem[] = [
  { name: 'Mis Talleres', href: '/provider/workshops', icon: Wrench, tourId: 'provider-workshops' },
]

export const adminNavigation: NavItem[] = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, tourId: 'admin' },
  { name: 'Usuarios', href: '/admin/users', icon: Users, tourId: 'admin-users' },
  { name: 'Analiticas', href: '/admin/analytics', icon: BarChart3, tourId: 'admin-analytics' },
  { name: 'Coaches', href: '/admin/coaches', icon: UserCheck, tourId: 'admin-coaches' },
  { name: 'Proveedores', href: '/admin/providers', icon: Building2, tourId: 'admin-providers' },
  { name: 'Tienda', href: '/admin/tienda', icon: ShoppingBag, tourId: 'admin-shop' },
  { name: 'Encordado', href: '/admin/encordado', icon: Wrench, tourId: 'admin-stringing' },
  { name: 'Canchas', href: '/admin/courts', icon: MapPin, tourId: 'admin-courts' },
]

export interface NavSection {
  items: NavItem[]
  label?: string
}

interface SessionUser {
  hasPlayerProfile?: boolean
  hasCoachProfile?: boolean
  isProvider?: boolean
  providerTypes?: string[]
  role?: string
}

export function getNavigationSections(user: SessionUser | undefined, sportLabel: string): NavSection[] {
  const sections: NavSection[] = []

  // Sport section: available if user has player or coach profile
  if (user?.hasPlayerProfile || user?.hasCoachProfile) {
    sections.push({ items: sportNavigation, label: sportLabel })
  }

  // Competition: available to all authenticated users
  sections.push({ items: competitionNavigation, label: 'Competencia' })

  // General
  sections.push({ items: globalNavigation, label: 'General' })

  // Coach management
  if (user?.hasCoachProfile) {
    sections.push({ items: [...coachNavigation, { name: 'Solicitudes', href: '/coach/requests', icon: Inbox, tourId: 'coach-requests' }], label: 'Gestion Coach' })
  }

  // Provider management
  if (user?.isProvider) {
    const providerItems: NavItem[] = []
    if (user.providerTypes?.includes('COURT')) {
      providerItems.push(...providerCourtNavigation)
    }
    if (user.providerTypes?.includes('WORKSHOP')) {
      providerItems.push(...providerWorkshopNavigation)
    }
    if (providerItems.length > 0) {
      sections.push({ items: providerItems, label: 'Proveedor' })
    }
  }

  // Admin
  if (user?.role === 'ADMIN') {
    sections.push({ items: adminNavigation, label: 'Administracion' })
  }

  // Profile (always last)
  sections.push({ items: profileNavigation })

  return sections
}

export const SPORT_EMOJI: Record<string, string> = {
  tennis: '🎾',
  padel: '🏓',
  pickleball: '🏸',
  futbol: '⚽',
}
