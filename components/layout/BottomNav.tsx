'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Trophy, ShoppingBag, Wrench, User } from 'lucide-react'

const tabs = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Rankings', href: '/rankings', icon: Trophy },
  { name: 'Tienda', href: '/tienda', icon: ShoppingBag },
  { name: 'Encordado', href: '/encordado', icon: Wrench },
  { name: 'Perfil', href: '/profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-medium border-t border-glass pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
