'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput } from '@/components/ui/glass-input'
import { Loader2 } from 'lucide-react'

interface ChallengeFormData {
  proposedDate: string
  proposedTime: string
  proposedVenue: string
  message: string
}

interface ChallengeFormProps {
  opponentName: string
  onSubmit: (data: ChallengeFormData) => void
  onCancel: () => void
  loading: boolean
}

export function ChallengeForm({ opponentName, onSubmit, onCancel, loading }: ChallengeFormProps) {
  const [formData, setFormData] = useState<ChallengeFormData>({
    proposedDate: '',
    proposedTime: '',
    proposedVenue: '',
    message: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <h3 className="text-lg font-semibold mb-4">
        Desafiar a {opponentName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Fecha propuesta</label>
          <GlassInput
            type="date"
            value={formData.proposedDate}
            onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Hora propuesta</label>
          <GlassInput
            type="time"
            value={formData.proposedTime}
            onChange={(e) => setFormData({ ...formData, proposedTime: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Lugar propuesto</label>
          <GlassInput
            type="text"
            placeholder="Nombre del club o cancha"
            value={formData.proposedVenue}
            onChange={(e) => setFormData({ ...formData, proposedVenue: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Mensaje (opcional)</label>
          <textarea
            className="flex w-full rounded-xl px-4 py-2 text-sm glass-light border-glass placeholder:text-muted-foreground/60 transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)] focus:glass-medium focus:border-primary/40 focus:shadow-glass-glow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
            placeholder="Escribe un mensaje para tu rival..."
            maxLength={500}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formData.message.length}/500
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <GlassButton
            type="submit"
            variant="solid"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Enviar desafio
          </GlassButton>
          <GlassButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  )
}
