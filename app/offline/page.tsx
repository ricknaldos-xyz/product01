'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">Sin conexion</h1>
        <p className="text-muted-foreground">
          No se pudo conectar al servidor. Verifica tu conexion a internet e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
