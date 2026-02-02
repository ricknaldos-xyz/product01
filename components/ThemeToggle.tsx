'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <GlassButton variant="ghost" size="icon" aria-label="Cambiar tema">
        <Sun className="h-4 w-4" />
      </GlassButton>
    )
  }

  return (
    <GlassButton
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </GlassButton>
  )
}
