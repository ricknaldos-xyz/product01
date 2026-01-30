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

export const adminNavigation: NavItem[] = [
  { name: 'Admin Panel', href: '/admin', icon: Shield, tourId: 'admin' },
  { name: 'Usuarios', href: '/admin/users', icon: Users, tourId: 'admin-users' },
  { name: 'Analiticas', href: '/admin/analytics', icon: BarChart3, tourId: 'admin-analytics' },
  { name: 'Verificar Coaches', href: '/admin/coaches', icon: UserCheck, tourId: 'admin-coaches' },
]

export interface NavSection {
  items: NavItem[]
  label?: string
}

interface SessionUser {
  hasPlayerProfile?: boolean
  hasCoachProfile?: boolean
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
    sections.push({ items: coachNavigation, label: 'Gestion Coach' })
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
