'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'
import { GlassButton } from '@/components/ui/glass-button'
import { GraduationCap, Star, MapPin, Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Coach {
  id: string
  userId: string
  headline: string | null
  specialties: string[]
  yearsExperience: number | null
  city: string | null
  hourlyRate: number | null
  currency: string
  averageRating: number | null
  totalReviews: number
  verificationStatus: string
  user: { name: string | null; image: string | null }
  _count: { students: number }
}

export default function MarketplacePage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function fetchCoaches() {
      try {
        const res = await fetch('/api/marketplace/coaches', { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setCoaches(data.coaches)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        logger.error('Failed to fetch coaches')
      } finally {
        setLoading(false)
      }
    }
    fetchCoaches()
    return () => controller.abort()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Entrenadores</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : coaches.length === 0 ? (
        <GlassCard intensity="light" padding="xl">
          <div className="text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay entrenadores disponibles</p>
            <p className="text-sm mt-1">Pronto tendras entrenadores certificados en tu zona</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coaches.map((coach) => (
            <GlassCard key={coach.id} intensity="light" padding="lg" hover="lift" asChild>
              <Link href={`/marketplace/${coach.id}`}>
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {coach.user.image ? (
                      <Image src={coach.user.image} alt="" fill className="object-cover" />
                    ) : (
                      <GraduationCap className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{coach.user.name || 'Entrenador'}</p>
                      {coach.verificationStatus === 'VERIFIED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                          Verificado
                        </span>
                      )}
                    </div>
                    {coach.headline && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{coach.headline}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {coach.averageRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {coach.averageRating.toFixed(1)} ({coach.totalReviews})
                        </span>
                      )}
                      {coach.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {coach.city}
                        </span>
                      )}
                      {coach.yearsExperience && (
                        <span>{coach.yearsExperience} anos exp.</span>
                      )}
                      <span>{coach._count.students} alumnos</span>
                    </div>
                    {coach.hourlyRate && (
                      <p className="text-sm font-semibold mt-2">
                        S/ {coach.hourlyRate}/hora
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
