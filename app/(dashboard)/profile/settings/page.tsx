import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ArrowLeft, Bell, Shield, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SettingsForm } from './settings-form'

async function getUserSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailNotifications: true,
      reminderTime: true,
      subscription: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuracion</h1>
          <p className="text-muted-foreground">
            Administra tus preferencias y cuenta
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Notificaciones</h2>
        </div>
        <SettingsForm
          userId={user.id}
          initialData={{
            emailNotifications: user.emailNotifications,
            reminderTime: user.reminderTime,
          }}
        />
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
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
            <Button variant="outline" asChild>
              <Link href="/profile/settings/password">Cambiar</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
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
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {user.subscription}
            </span>
          </div>
          {user.stripeCurrentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Tu suscripcion se renueva el{' '}
              {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <div className="flex gap-2">
            {user.subscription === 'FREE' ? (
              <Button asChild>
                <Link href="/pricing">Mejorar Plan</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/api/stripe/portal">Gestionar Suscripcion</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/50 rounded-xl p-6">
        <h2 className="font-semibold text-destructive mb-4">Zona de Peligro</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Eliminar cuenta</p>
            <p className="text-sm text-muted-foreground">
              Esta accion es irreversible y eliminara todos tus datos
            </p>
          </div>
          <Button variant="destructive" disabled>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
