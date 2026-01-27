'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al enviar el email')
        setIsLoading(false)
        return
      }

      setIsSubmitted(true)
    } catch {
      toast.error('Algo salio mal')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md">
        <GlassCard intensity="medium" padding="xl">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/20 border border-success/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Revisa tu email</h1>
            <p className="text-muted-foreground mb-6">
              Si existe una cuenta con <strong>{email}</strong>, recibiras instrucciones para restablecer tu contrasena.
            </p>
            <div className="space-y-3">
              <GlassButton
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Usar otro email
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
          Olvidaste tu contrasena?
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Ingresa tu email y te enviaremos instrucciones para restablecerla
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <GlassInput
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar instrucciones'
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
