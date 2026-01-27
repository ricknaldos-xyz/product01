'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Star, Loader2 } from 'lucide-react'

interface RatingData {
  sportsmanship: number
  punctuality: number
  skillAccuracy: number
  comment: string
}

interface RatingFormProps {
  opponentName: string
  onSubmit: (data: RatingData) => void
  loading: boolean
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function RatingForm({ opponentName, onSubmit, loading }: RatingFormProps) {
  const [ratings, setRatings] = useState<RatingData>({
    sportsmanship: 0,
    punctuality: 0,
    skillAccuracy: 0,
    comment: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (ratings.sportsmanship === 0 || ratings.punctuality === 0 || ratings.skillAccuracy === 0) {
      return
    }
    onSubmit(ratings)
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <h3 className="text-lg font-semibold mb-4">
        Calificar a {opponentName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <StarRating
          label="Deportividad"
          value={ratings.sportsmanship}
          onChange={(v) => setRatings({ ...ratings, sportsmanship: v })}
        />
        <StarRating
          label="Puntualidad"
          value={ratings.punctuality}
          onChange={(v) => setRatings({ ...ratings, punctuality: v })}
        />
        <StarRating
          label="Precision de nivel"
          value={ratings.skillAccuracy}
          onChange={(v) => setRatings({ ...ratings, skillAccuracy: v })}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">Comentario (opcional)</label>
          <textarea
            className="flex w-full rounded-xl px-4 py-2 text-sm glass-light border-glass placeholder:text-muted-foreground/60 transition-all duration-[var(--duration-normal)] ease-[var(--ease-liquid)] focus:glass-medium focus:border-primary/40 focus:shadow-glass-glow focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
            placeholder="Escribe un comentario sobre el partido..."
            maxLength={500}
            value={ratings.comment}
            onChange={(e) => setRatings({ ...ratings, comment: e.target.value })}
          />
        </div>

        <GlassButton
          type="submit"
          variant="solid"
          disabled={loading || ratings.sportsmanship === 0 || ratings.punctuality === 0 || ratings.skillAccuracy === 0}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Enviar calificacion
        </GlassButton>
      </form>
    </GlassCard>
  )
}
