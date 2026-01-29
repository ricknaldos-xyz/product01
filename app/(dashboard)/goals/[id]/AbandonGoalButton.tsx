'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AbandonGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAbandon() {
    setLoading(true)
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ABANDONED' }),
      })

      if (res.ok) {
        toast.success('Objetivo abandonado')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al abandonar el objetivo')
      }
    } catch {
      toast.error('Error de conexion')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <GlassCard intensity="light" padding="lg" className="border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-destructive mb-1">Abandonar objetivo</p>
            <p className="text-sm text-muted-foreground mb-4">
              Esta accion no se puede deshacer. El objetivo quedara marcado como abandonado.
            </p>
            <div className="flex gap-3">
              <GlassButton
                variant="destructive"
                size="sm"
                onClick={handleAbandon}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Confirmar abandono
              </GlassButton>
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Cancelar
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="flex justify-end">
      <GlassButton
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Abandonar objetivo
      </GlassButton>
    </div>
  )
}
