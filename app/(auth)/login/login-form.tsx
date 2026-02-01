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
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Target,
  Brain,
  Trophy,
  Swords,
  CheckCircle2,
  Quote,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setHasError(false)

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
        toast.error('Email o contrasena incorrectos')
        setHasError(true)
        setIsLoading(false)
        return
      }

      toast.success('Bienvenido de vuelta!')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Algo salio mal. Intenta de nuevo.')
      setHasError(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <GlassCard intensity="medium" padding="none" className="overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Left panel — Branding & Social Proof (hidden on mobile) */}
          <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

            {/* Top: Logo & Tagline */}
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="bg-primary/20 border border-primary/30 rounded-xl p-2.5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold">SportTek</span>
              </Link>

              <h2 className="text-2xl font-bold leading-tight mb-3">
                Tu carrera deportiva en
                <br />
                <span className="text-primary">una sola plataforma</span>
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Analiza tu tecnica, compite en rankings y conecta con la comunidad deportiva de Peru.
              </p>
            </div>

            {/* Middle: Value Props */}
            <div className="relative z-10 space-y-4">
              {[
                { icon: Brain, text: 'Analisis IA en 2 minutos' },
                { icon: Trophy, text: 'Rankings nacionales en vivo' },
                { icon: Swords, text: 'Matchmaking inteligente' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>

            {/* Bottom: Testimonial */}
            <div className="relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <Quote className="h-5 w-5 text-primary/60 mb-3" />
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  &ldquo;Despues de 5 analisis tengo claro mis fortalezas y debilidades. El plan de entrenamiento me da ejercicios nuevos cada semana.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Maria L.</p>
                    <p className="text-xs text-slate-500">Jugadora de padel — Surco</p>
                  </div>
                </div>
              </div>

              {/* Sports */}
              <div className="flex items-center gap-4 mt-5 text-slate-500 text-sm">
                <span>Disponible para</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span>🎾</span> Tenis
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span>🏓</span> Padel
                </span>
              </div>
            </div>
          </div>

          {/* Right panel — Login Form */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* Mobile branding (hidden on desktop) */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="glass-primary border-glass rounded-xl p-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">SportTek</span>
              </Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" /> Analisis IA
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" /> Rankings
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" /> Matchmaking
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1">Bienvenido de vuelta</h1>
              <p className="text-muted-foreground">
                Inicia sesion para continuar mejorando tu tecnica
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className={cn('space-y-5', hasError && 'animate-shake')}
              onAnimationEnd={() => setHasError(false)}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <GlassInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contrasena</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Olvidaste tu contrasena?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <GlassInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <GlassButton
                type="submit"
                variant="solid"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </GlassButton>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-glass" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background/80 backdrop-blur-sm px-3 text-muted-foreground">
                  o
                </span>
              </div>
            </div>

            {/* Register CTA */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Nuevo en SportTek?
              </p>
              <GlassButton variant="outline" className="w-full" asChild>
                <Link href="/register">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </GlassButton>
            </div>

            {/* Trust badges — mobile only */}
            <div className="lg:hidden flex items-center justify-center gap-4 mt-8 text-xs text-muted-foreground">
              <span>🎾 Tenis</span>
              <span>🏓 Padel</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
