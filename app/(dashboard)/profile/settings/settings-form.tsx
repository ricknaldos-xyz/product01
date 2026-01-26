'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SettingsFormProps {
  userId: string
  initialData: {
    emailNotifications: boolean
    reminderTime: string | null
  }
}

export function SettingsForm({ userId, initialData }: SettingsFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(
    initialData.emailNotifications
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="emailNotifications" className="font-medium">
            Notificaciones por email
          </Label>
          <p className="text-sm text-muted-foreground">
            Recibe emails sobre tu progreso y analisis
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
          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderTime">Hora de recordatorio diario</Label>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un recordatorio para entrenar a esta hora
        </p>
        <Input
          id="reminderTime"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          disabled={!emailNotifications}
          className="max-w-[150px]"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
