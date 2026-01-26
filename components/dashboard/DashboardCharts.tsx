'use client'

import { useEffect, useState } from 'react'
import { ScoreChart } from '@/components/charts/ScoreChart'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { Loader2 } from 'lucide-react'

interface ChartData {
  scoreData: Array<{ technique: string; score: number; date: string }>
  activityData: Array<{ date: string; analyses: number; exercises: number }>
  progressData: Array<{ date: string; completed: number; total: number }>
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-card border border-border rounded-xl p-6">
        <ScoreChart
          data={data?.scoreData || []}
          title="Puntuaciones Recientes"
        />
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <ActivityChart
          data={data?.activityData || []}
          title="Actividad Ultimos 14 Dias"
        />
      </div>
    </div>
  )
}
