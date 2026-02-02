import type { Metadata } from 'next'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Configuracion | SportTek',
  description: 'Administra tus preferencias de cuenta, notificaciones y suscripcion.',
}
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ArrowLeft, Bell, Shield, CreditCard, Download, Palette } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import Link from 'next/link'
import { SettingsForm } from './settings-form'
import { ThemeSelector } from './theme-selector'

async function getUserSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailNotifications: true,
      weeklyDigestEnabled: true,
      reminderTime: true,
      subscription: true,
      culqiCustomerId: true,
      culqiSubscriptionId: true,
      culqiCurrentPeriodEnd: true,
    },
  })
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await getUserSettings(session.user.id)
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Configuracion</h1>
          <p className="text-muted-foreground">
            Administra tus preferencias y cuenta
          </p>
        </div>
      </div>

      {/* Notifications */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass-primary border-glass rounded-lg p-1.5">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold">Notificaciones</h2>
        </div>
        <SettingsForm
          userId={user.id}
          initialData={{
            emailNotifications: user.emailNotifications,
            weeklyDigestEnabled: user.weeklyDigestEnabled,
            reminderTime: user.reminderTime,
          }}
        />
      </GlassCard>

      {/* Appearance */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass-primary border-glass rounded-lg p-1.5">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold">Apariencia</h2>
        </div>
        <ThemeSelector />
      </GlassCard>

      {/* Security */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass-primary border-glass rounded-lg p-1.5">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold">Seguridad</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cambiar contrasena</p>
              <p className="text-sm text-muted-foreground">
                Actualiza tu contrasena de acceso
              </p>
            </div>
            <GlassButton variant="outline" asChild>
              <Link href="/profile/settings/password">Cambiar</Link>
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Subscription */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass-primary border-glass rounded-lg p-1.5">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold">Suscripcion</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan actual</p>
              <p className="text-sm text-muted-foreground">
                {user.subscription === 'FREE' && 'Plan gratuito con funciones basicas'}
                {user.subscription === 'PRO' && 'Plan Pro con analisis ilimitados'}
                {user.subscription === 'ELITE' && 'Plan Elite con todas las funciones'}
              </p>
            </div>
            <GlassBadge variant="primary">{user.subscription}</GlassBadge>
          </div>
          {user.culqiCurrentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Tu suscripcion se renueva el{' '}
              {new Date(user.culqiCurrentPeriodEnd).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <div className="flex gap-2">
            {user.subscription === 'FREE' ? (
              <GlassButton variant="solid" asChild>
                <Link href="/pricing">Mejorar Plan</Link>
              </GlassButton>
            ) : (
              <GlassButton variant="outline" asChild>
                <Link href="/profile/settings/subscription">Gestionar Suscripcion</Link>
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Data Export (GDPR) */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="glass-primary border-glass rounded-lg p-1.5">
            <Download className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold">Tus Datos</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Exportar todos mis datos</p>
            <p className="text-sm text-muted-foreground">
              Descarga una copia de toda tu informacion en formato JSON
            </p>
          </div>
          <GlassButton variant="outline" asChild>
            <a href="/api/user/export" download>Exportar</a>
          </GlassButton>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard intensity="light" padding="lg" className="border-destructive/30">
        <h2 className="font-semibold text-destructive mb-4">Zona de Peligro</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Eliminar cuenta</p>
            <p className="text-sm text-muted-foreground">
              Esta accion es irreversible y eliminara todos tus datos
            </p>
          </div>
          <GlassButton variant="outline" disabled className="border-destructive/50 text-destructive hover:bg-destructive/10">
            Eliminar
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
