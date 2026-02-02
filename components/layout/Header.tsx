'use client'

import { signOut, useSession } from 'next-auth/react'
import { Menu, LogOut, User, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationBell } from '@/components/social/NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassNavbar } from '@/components/ui/glass-navbar'
import Link from 'next/link'
import { SportSelectorPill } from '@/components/layout/SportSelectorPill'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <GlassNavbar>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <GlassButton
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </GlassButton>

        {/* Sport Selector - only visible on mobile (desktop uses sidebar) */}
        <div className="lg:hidden">
          <SportSelectorPill />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle + Notifications */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GlassButton variant="ghost" className="flex items-center gap-2" aria-label="Menu de usuario">
              <div className="w-8 h-8 rounded-full glass-primary border-glass flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:inline-block text-sm font-medium">
                {session?.user?.name || 'Usuario'}
              </span>
            </GlassButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-medium border-glass">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-glass-border-light" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuracion
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-glass-border-light" />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassNavbar>
  )
}
