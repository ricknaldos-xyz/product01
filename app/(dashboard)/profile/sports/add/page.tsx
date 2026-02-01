'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Loader2, Check, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Sport {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string | null
  isActive: boolean
}

const SPORT_EMOJI: Record<string, string> = {
  tennis: '🎾',
  padel: '🏓',
  pickleball: '🏸',
  futbol: '⚽',
}

export default function AddSportPage() {
  const router = useRouter()
  const [allSports, setAllSports] = useState<Sport[]>([])
  const [userSportIds, setUserSportIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [sportsRes, userSportsRes] = await Promise.all([
          fetch('/api/sports?all=true'),
          fetch('/api/player/sports'),
        ])

        if (sportsRes.ok) {
          setAllSports(await sportsRes.json())
        }
        if (userSportsRes.ok) {
          const userSports: { id: string }[] = await userSportsRes.json()
          setUserSportIds(new Set(userSports.map((s) => s.id)))
        }
      } catch (error) {
        logger.error('Failed to fetch sports:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const availableSports = allSports.filter((s) => s.isActive && !userSportIds.has(s.id))
  const comingSoonSports = allSports.filter((s) => !s.isActive)

  async function handleAdd() {
    if (!selectedId) return
    setSubmitting(true)

    try {
      await fetch('/api/player/sport-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportId: selectedId }),
      })

      router.push('/profile')
      router.refresh()
    } catch (error) {
      logger.error('Failed to add sport:', error)
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </GlassButton>
        <h1 className="text-2xl font-bold">Agregar deporte</h1>
      </div>

      {availableSports.length === 0 && comingSoonSports.length === 0 ? (
        <GlassCard intensity="light" padding="xl" className="text-center">
          <p className="text-muted-foreground">Ya tienes todos los deportes disponibles.</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableSports.map((sport) => {
              const emoji = SPORT_EMOJI[sport.slug] ?? '🏅'
              const isSelected = selectedId === sport.id

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
                      <h3 className="font-semibold text-lg">{sport.name}</h3>
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

            {/* Coming soon sports */}
            {comingSoonSports.map((sport) => {
              const emoji = SPORT_EMOJI[sport.slug] ?? '🏅'
              return (
                <GlassCard
                  key={sport.id}
                  intensity="ultralight"
                  padding="lg"
                  className="opacity-60 cursor-default border-2 border-transparent"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{sport.name}</h3>
                        <GlassBadge variant="default" size="sm">Proximamente</GlassBadge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Disponible pronto</p>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>

          {availableSports.length > 0 && (
            <GlassButton
              variant="solid"
              className="w-full"
              disabled={!selectedId || submitting}
              onClick={handleAdd}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar deporte'
              )}
            </GlassButton>
          )}
        </>
      )}
    </div>
  )
}
