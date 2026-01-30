'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { logger } from '@/lib/logger'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center py-16">
      <GlassCard intensity="medium" padding="xl" className="max-w-md text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
        <h2 className="text-xl font-bold mb-2">Algo salio mal</h2>
        <p className="text-muted-foreground mb-6">
          Ocurrio un error al cargar esta pagina.
        </p>
        <GlassButton variant="solid" onClick={reset}>
          Intentar de nuevo
        </GlassButton>
      </GlassCard>
    </div>
  )
}
