'use client'

import { useState, useEffect } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassCard } from '@/components/ui/glass-card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface ConfigField {
  key: string
  type: 'select' | 'toggle'
  label: string
  options: string[] | { value: string; label: string }[]
}

interface SportProfileFormProps {
  sportId: string
  sportName: string
  configSchema: { fields: ConfigField[] } | null
  initialConfig?: Record<string, string> | null
  onSaved?: () => void
}

export function SportProfileForm({
  sportId,
  sportName,
  configSchema,
  initialConfig,
  onSaved,
}: SportProfileFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialConfig) {
      setFormData(initialConfig)
    }
  }, [initialConfig])

  const fields = configSchema?.fields || []

  function updateField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/player/sport-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportId, sportConfig: formData }),
      })

      if (!res.ok) {
        const data = await res.json()
        logger.error('Error saving sport profile:', data.error)
        return
      }

      onSaved?.()
    } catch (error) {
      logger.error('Error saving sport profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (fields.length === 0) {
    return null
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <h3 className="text-lg font-semibold mb-4">Perfil de {sportName}</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            {field.type === 'select' && (
              <select
                value={formData[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                disabled={isLoading}
                className="w-full h-11 rounded-xl glass-light border border-glass px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Selecciona...</option>
                {(field.options as string[]).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === 'toggle' && (
              <div className="flex gap-2">
                {(field.options as { value: string; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField(field.key, opt.value)}
                    disabled={isLoading}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData[field.key] === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-glass bg-glass-light text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <GlassButton type="submit" variant="solid" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar perfil deportivo'
          )}
        </GlassButton>
      </form>
    </GlassCard>
  )
}
