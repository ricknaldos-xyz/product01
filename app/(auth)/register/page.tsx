'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, User, GraduationCap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<'PLAYER' | 'COACH'>('PLAYER')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula y un numero')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, accountType }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al registrarse')
        setIsLoading(false)
        return
      }

      toast.success('Cuenta creada exitosamente!')

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // If auto-login fails, redirect to login page
        router.push('/login')
        return
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard')
    } catch {
      toast.error('Algo salio mal')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <GlassCard intensity="medium" padding="xl">
        <h1 className="text-2xl font-bold text-center mb-2">Crear cuenta</h1>
        <p className="text-muted-foreground text-center mb-6">
          Registrate para comenzar a mejorar tu tecnica
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Account Type Selector */}
          <div className="space-y-2">
            <Label>Tipo de cuenta</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('PLAYER')}
                disabled={isLoading}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === 'PLAYER'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-glass bg-glass-light text-muted-foreground hover:border-primary/50'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Jugador</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('COACH')}
                disabled={isLoading}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === 'COACH'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-glass bg-glass-light text-muted-foreground hover:border-primary/50'
                }`}
              >
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm font-medium">Entrenador</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <GlassInput
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              required
              disabled={isLoading}
            />
          </div>

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
            <Label htmlFor="password">Contrasena</Label>
            <GlassInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimo 8 caracteres, una mayuscula, una minuscula y un numero
          </p>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
            <GlassInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </GlassButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesion
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
