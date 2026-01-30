'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive opacity-70" />
        <h1 className="text-2xl font-bold mb-2">Algo salio mal</h1>
        <p className="text-muted-foreground mb-6">
          Ocurrio un error inesperado. Por favor intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
