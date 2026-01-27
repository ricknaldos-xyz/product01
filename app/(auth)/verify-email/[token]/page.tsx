'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

type VerificationState = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<VerificationState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifyEmail() {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Error al verificar el email')
          setState('error')
          return
        }

        setState('success')

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch {
        setError('Algo salio mal')
        setState('error')
      }
    }

    verifyEmail()
  }, [token, router])

  if (state === 'loading') {
    return (
      <div className="w-full max-w-md">
        <GlassCard intensity="medium" padding="xl">
          <div className="text-center">
            <div className="glass-primary border-glass rounded-full p-4 w-fit mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verificando email...</h1>
            <p className="text-muted-foreground">
              Espera un momento mientras verificamos tu email.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="w-full max-w-md">
        <GlassCard intensity="medium" padding="xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/20 border border-success/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email verificado</h1>
            <p className="text-muted-foreground mb-6">
              Tu email ha sido verificado exitosamente. Seras redirigido al dashboard en unos segundos.
            </p>
            <GlassButton variant="solid" className="w-full" asChild>
              <Link href="/dashboard">
                Ir al Dashboard
              </Link>
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard intensity="medium" padding="xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/20 border border-destructive/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Error de verificacion</h1>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <GlassButton variant="solid" className="w-full" asChild>
              <Link href="/dashboard">
                Ir al Dashboard
              </Link>
            </GlassButton>
            <p className="text-sm text-muted-foreground">
              Puedes solicitar un nuevo enlace de verificacion desde tu perfil.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
