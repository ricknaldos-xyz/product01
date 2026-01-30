'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Loader2, MapPin } from 'lucide-react'
import { logger } from '@/lib/logger'

interface CoverageData {
  districts: string[]
  proximamente: string[]
}

export function CoverageMap() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCoverage() {
      try {
        const res = await fetch('/api/stringing/coverage')
        if (res.ok) {
          const data = await res.json()
          setCoverage(data)
        }
      } catch {
        logger.error('Error fetching coverage')
      } finally {
        setLoading(false)
      }
    }
    fetchCoverage()
  }, [])

  if (loading) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </GlassCard>
    )
  }

  if (!coverage) {
    return (
      <GlassCard intensity="light" padding="lg">
        <p className="text-muted-foreground text-center">
          No se pudo cargar la informacion de cobertura.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard intensity="light" padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Cobertura</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Distritos activos:</p>
          <div className="flex flex-wrap gap-2">
            {coverage.districts.map((district) => (
              <GlassBadge key={district} variant="success">
                {district}
              </GlassBadge>
            ))}
          </div>
        </div>

        {coverage.proximamente.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Proximamente:</p>
            <div className="flex flex-wrap gap-2">
              {coverage.proximamente.map((city) => (
                <div key={city} className="flex items-center gap-1.5">
                  <GlassBadge variant="default">{city}</GlassBadge>
                  <GlassBadge variant="warning" size="sm">Pronto</GlassBadge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
