'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sport {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
}

const SPORT_EMOJI: Record<string, string> = {
  tennis: '🎾',
  padel: '🏓',
  pickleball: '🏸',
  futbol: '⚽',
}

export default function SportSelectionPage() {
  const router = useRouter()
  const [sports, setSports] = useState<Sport[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports')
        if (res.ok) {
          const data = await res.json()
          setSports(data)
        }
      } catch (error) {
        logger.error('Failed to fetch sports:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSports()
  }, [])

  async function handleContinue() {
    if (!selectedId) return
    setSubmitting(true)

    try {
      // Create UserSport + SportProfile
      await fetch('/api/player/sport-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportId: selectedId }),
      })

      router.push('/profile/player/edit')
      router.refresh()
    } catch (error) {
      logger.error('Failed to select sport:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Elige tu deporte</h1>
        <p className="text-muted-foreground">
          Selecciona el deporte principal que quieres mejorar. Tu primer deporte esta incluido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sports.map((sport, index) => {
          const emoji = SPORT_EMOJI[sport.slug] ?? '🏅'
          const isSelected = selectedId === sport.id
          const isFree = index === 0

          return (
            <GlassCard
              key={sport.id}
              intensity={isSelected ? 'primary' : 'light'}
              padding="lg"
              hover="lift"
              className={cn(
                'cursor-pointer transition-all border-2',
                isSelected ? 'border-primary' : 'border-transparent'
              )}
              onClick={() => setSelectedId(sport.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{sport.name}</h3>
                    {isFree && (
                      <GlassBadge variant="success" size="sm">Incluido</GlassBadge>
                    )}
                    {!isFree && (
                      <GlassBadge variant="default" size="sm">Addon</GlassBadge>
                    )}
                  </div>
                  {sport.description && (
                    <p className="text-sm text-muted-foreground mt-1">{sport.description}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      <GlassButton
        variant="solid"
        className="w-full"
        disabled={!selectedId || submitting}
        onClick={handleContinue}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Configurando...
          </>
        ) : (
          'Continuar'
        )}
      </GlassButton>
    </div>
  )
}
