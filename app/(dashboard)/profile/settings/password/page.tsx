'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contrasenas no coinciden')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contrasena')
      }

      toast.success('Contrasena actualizada correctamente')
      router.push('/profile/settings')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar contrasena')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cambiar Contrasena</h1>
          <p className="text-muted-foreground">
            Actualiza tu contrasena de acceso
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Nueva contrasena</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contrasena actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contrasena</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Minimo 8 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/profile/settings">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Actualizar Contrasena'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
