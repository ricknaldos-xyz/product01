'use client'

import { useState } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SettingsFormProps {
  userId: string
  initialData: {
    emailNotifications: boolean
    weeklyDigestEnabled: boolean
    reminderTime: string | null
  }
}

export function SettingsForm({ userId, initialData }: SettingsFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(
    initialData.emailNotifications
  )
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(
    initialData.weeklyDigestEnabled
  )
  const [reminderTime, setReminderTime] = useState(
    initialData.reminderTime || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          weeklyDigestEnabled,
          reminderTime: reminderTime || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar configuracion')
      }

      toast.success('Configuracion guardada')
    } catch {
      toast.error('Error al guardar configuracion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="emailNotifications" className="font-medium">
            Notificaciones por email
          </Label>
          <p className="text-sm text-muted-foreground">
            Recibe emails sobre tu progreso, analisis y recordatorios
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 glass-ultralight border-glass rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background dark:after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all duration-[var(--duration-normal)]" />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="weeklyDigest" className="font-medium">
            Resumen semanal
          </Label>
          <p className="text-sm text-muted-foreground">
            Recibe un email cada lunes con tu resumen de la semana
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="weeklyDigest"
            checked={weeklyDigestEnabled}
            onChange={(e) => setWeeklyDigestEnabled(e.target.checked)}
            disabled={!emailNotifications}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 glass-ultralight border-glass rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background dark:after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all duration-[var(--duration-normal)] ${!emailNotifications ? 'opacity-50' : ''}`} />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderTime">Hora de recordatorio diario</Label>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un recordatorio para entrenar a esta hora
        </p>
        <GlassInput
          id="reminderTime"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          disabled={!emailNotifications}
          className="max-w-[150px]"
        />
      </div>

      <GlassButton variant="solid" type="submit" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar cambios'}
      </GlassButton>
    </form>
  )
}
