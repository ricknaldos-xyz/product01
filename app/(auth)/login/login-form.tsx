'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciales invalidas')
        setIsLoading(false)
        return
      }

      toast.success('Bienvenido de vuelta!')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Algo salio mal')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard intensity="medium" padding="xl">
        <h1 className="text-2xl font-bold text-center mb-2">Iniciar sesion</h1>
        <p className="text-muted-foreground text-center mb-6">
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <GlassInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contrasena</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Olvidaste tu contrasena?
              </Link>
            </div>
            <GlassInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </GlassButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          No tienes una cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
