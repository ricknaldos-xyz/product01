'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-[72px]" />
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Elige como se ve la aplicacion. La opcion Sistema se adapta automaticamente a tu dispositivo.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
              theme === value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-glass glass-ultralight text-muted-foreground hover:text-foreground hover:border-foreground/20'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
