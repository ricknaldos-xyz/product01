'use client'

import { useState } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { AlertTriangle, Mail, X, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EmailVerificationBannerProps {
  userEmail: string
}

export function EmailVerificationBanner({ userEmail }: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResent, setIsResent] = useState(false)

  async function handleResendVerification() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al enviar el email')
        return
      }

      setIsResent(true)
      toast.success('Email de verificacion enviado')
    } catch {
      toast.error('Algo salio mal')
    } finally {
      setIsLoading(false)
    }
  }

  if (isDismissed) {
    return null
  }

  return (
    <GlassCard intensity="medium" padding="md" className="border-warning/30 mb-6">
      <div className="flex items-start gap-3">
        <div className="bg-warning/20 rounded-full p-1.5 flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">
            Verifica tu email
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Por favor verifica tu email ({userEmail}) para acceder a todas las funciones.
            {isResent && (
              <span className="flex items-center gap-1 mt-1 text-success">
                <CheckCircle className="h-4 w-4" />
                Email enviado. Revisa tu bandeja de entrada.
              </span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <GlassButton
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isLoading || isResent}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : isResent ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Enviado
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar email
                </>
              )}
            </GlassButton>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </GlassCard>
  )
}
