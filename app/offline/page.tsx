'use client'

import { GlassButton } from '@/components/ui/glass-button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">Sin conexion</h1>
        <p className="text-muted-foreground">
          No se pudo conectar al servidor. Verifica tu conexion a internet e intenta de nuevo.
        </p>
        <GlassButton
          variant="solid"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </GlassButton>
      </div>
    </div>
  )
}
