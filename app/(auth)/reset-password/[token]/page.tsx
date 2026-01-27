'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al restablecer la contrasena')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast.success('Contrasena actualizada exitosamente')
    } catch {
      setError('Algo salio mal')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <GlassCard intensity="medium" padding="xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/20 border border-success/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Contrasena actualizada</h1>
            <p className="text-muted-foreground mb-6">
              Tu contrasena ha sido restablecida exitosamente. Ya puedes iniciar sesion con tu nueva contrasena.
            </p>
            <GlassButton variant="solid" className="w-full" asChild>
              <Link href="/login">
                Iniciar sesion
              </Link>
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (error && (error.includes('expirado') || error.includes('utilizado') || error.includes('no encontrado'))) {
    return (
      <div className="w-full max-w-md">
        <GlassCard intensity="medium" padding="xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/20 border border-destructive/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Enlace invalido</h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <GlassButton variant="solid" className="w-full" asChild>
                <Link href="/forgot-password">
                  Solicitar nuevo enlace
                </Link>
              </GlassButton>
              <GlassButton variant="ghost" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a iniciar sesion
                </Link>
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard intensity="medium" padding="xl">
        <h1 className="text-2xl font-bold text-center mb-2">
          Crear nueva contrasena
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Ingresa tu nueva contrasena
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contrasena</Label>
            <GlassInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
            <GlassInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {error && !error.includes('expirado') && !error.includes('utilizado') && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar contrasena'
            )}
          </GlassButton>
        </form>

        <div className="mt-6">
          <GlassButton variant="ghost" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a iniciar sesion
            </Link>
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
