'use client'

import { useEffect, useState } from 'react'
import { ScoreChart } from '@/components/charts/ScoreChart'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { GlassCard } from '@/components/ui/glass-card'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import { useSport } from '@/contexts/SportContext'

interface ChartData {
  scoreData: Array<{ technique: string; score: number; date: string }>
  activityData: Array<{ date: string; analyses: number; exercises: number }>
  progressData: Array<{ date: string; completed: number; total: number }>
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const { activeSport } = useSport()

  useEffect(() => {
    async function fetchData() {
      try {
        const sportParam = activeSport?.slug || 'tennis'
        const response = await fetch(`/api/stats?sport=${sportParam}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        logger.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeSport?.slug])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard intensity="light" padding="lg">
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </GlassCard>
        <GlassCard intensity="light" padding="lg">
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <GlassCard intensity="light" padding="lg">
        <ScoreChart
          data={data?.scoreData || []}
          title="Puntuaciones Recientes"
        />
      </GlassCard>
      <GlassCard intensity="light" padding="lg">
        <ActivityChart
          data={data?.activityData || []}
          title="Actividad Ultimos 14 Dias"
        />
      </GlassCard>
    </div>
  )
}
